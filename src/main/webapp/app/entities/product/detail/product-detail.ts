import { Component, input, signal, computed, effect, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule, DecimalPipe } from '@angular/common';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslateModule } from '@ngx-translate/core';
import { IProduct } from '../product.model';
import { IMedia } from '../../media/media.model';
import { OrderCheckoutService } from '../../order/service/order-checkout';
import { ToastService } from '../../../shared/notification/toast.service';
import { ProductService } from '../service/product.service';
import { HttpResponse } from '@angular/common/http';

interface ImageItem {
  id: number | null;
  url: string | null | undefined;
  isMain: boolean;
}

@Component({
  selector: 'jhi-product-detail',
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css',
  imports: [CommonModule, DecimalPipe, FontAwesomeModule, TranslateModule, RouterLink],
})
export class ProductDetail {
  readonly product = input<IProduct | null>(null);
  protected readonly Math = Math;
  protected readonly serverApiUrl = 'http://localhost:8080';

  readonly currentImageIndex = signal(0);
  readonly isImageLoading = signal(false);
  readonly similarProducts = signal<IProduct[]>([]);

  private touchStartX = 0;
  private touchEndX = 0;
  private readonly SWIPE_THRESHOLD = 50;

  private readonly checkoutService = inject(OrderCheckoutService);
  private readonly toastService = inject(ToastService);
  private readonly productService = inject(ProductService);
  private readonly router = inject(Router);

  readonly allImages = computed<ImageItem[]>(() => {
    const p = this.product();
    if (!p) return [];

    const images: ImageItem[] = [];

    if (p.mainMedia?.url) {
      images.push({ id: p.mainMedia.id ?? null, url: p.mainMedia.url, isMain: true });
    }

    if (p.gallery) {
      for (const media of p.gallery) {
        if (media.url && !images.find(img => img.id === media.id)) {
          images.push({ id: media.id ?? null, url: media.url, isMain: false });
        }
      }
    }

    return images;
  });

  readonly currentImageUrl = computed<string>(() => {
    const images = this.allImages();
    const idx = this.currentImageIndex();
    if (images.length === 0) return '';
    if (idx >= images.length) return '';
    return this.getMediaUrl(images[idx].url);
  });

  readonly totalImages = computed(() => this.allImages().length);

  constructor() {
    effect(() => {
      const p = this.product();
      this.currentImageIndex.set(0);
      this.isImageLoading.set(true);
      if (p?.category) {
        this.loadSimilarProducts(p.category);
      }
    });
  }

  private loadSimilarProducts(category: string): void {
    this.productService
      .query({
        category: category,
        isActive: true,
        size: 4,
      })
      .subscribe({
        next: (res: HttpResponse<IProduct[]>) => {
          const products = res.body ?? [];
          const currentId = this.product()?.id;
          this.similarProducts.set(products.filter(p => p.id !== currentId).slice(0, 4));
        },
        error: () => {
          this.similarProducts.set([]);
        },
      });
  }

  addToCart(): void {
    const product = this.product();
    if (!product) return;

    if (!product.stock || product.stock <= 0) {
      this.toastService.warning(`${product.name} n'est plus en stock`);
      return;
    }

    this.checkoutService.initializeCheckout();

    setTimeout(() => {
      this.checkoutService.addProductToCart(product).subscribe({
        next: () => {
          this.toastService.success(`${product.name} ajouté au panier`);
        },
        error: () => {
          this.toastService.error(`Erreur lors de l'ajout de ${product.name}`);
        },
      });
    }, 5000);
  }

  buyNow(): void {
    const product = this.product();
    if (!product) return;

    if (!product.stock || product.stock <= 0) {
      this.toastService.warning(`${product.name} n'est plus en stock`);
      return;
    }

    this.checkoutService.initializeCheckout();

    setTimeout(() => {
      this.checkoutService.addProductToCart(product).subscribe({
        next: order => {
          this.toastService.success(`${product.name} ajouté au panier`);
          this.router.navigate(['/order/summary'], {
            queryParams: { orderId: order.id },
          });
        },
        error: () => {
          this.toastService.error(`Erreur lors de l'ajout de ${product.name}`);
        },
      });
    }, 500);
  }

  previousState(): void {
    globalThis.history.back();
  }

  nextImage(event?: Event): void {
    event?.stopPropagation();
    const total = this.totalImages();
    if (total <= 1) return;
    this.isImageLoading.set(true);
    this.currentImageIndex.update(idx => (idx + 1) % total);
  }

  previousImage(event?: Event): void {
    event?.stopPropagation();
    const total = this.totalImages();
    if (total <= 1) return;
    this.isImageLoading.set(true);
    this.currentImageIndex.update(idx => (idx - 1 + total) % total);
  }

  selectImage(index: number): void {
    if (index === this.currentImageIndex()) return;
    this.isImageLoading.set(true);
    this.currentImageIndex.set(index);
  }

  onImageLoad(): void {
    this.isImageLoading.set(false);
  }

  onImageError(): void {
    this.isImageLoading.set(false);
  }

  onTouchStart(event: TouchEvent): void {
    this.touchStartX = event.changedTouches[0].screenX;
  }

  onTouchEnd(event: TouchEvent): void {
    this.touchEndX = event.changedTouches[0].screenX;
    this.handleSwipe();
  }

  private handleSwipe(): void {
    const diff = this.touchStartX - this.touchEndX;
    if (Math.abs(diff) < this.SWIPE_THRESHOLD) return;

    if (diff > 0) {
      this.nextImage();
    } else {
      this.previousImage();
    }
  }

  isInStock(product: IProduct | null): boolean {
    return (product?.stock ?? 0) > 0;
  }

  getMediaUrl(url: string | null | undefined): string {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${this.serverApiUrl}${url}`;
  }

  isLowStock(product: IProduct | null): boolean {
    const stock = product?.stock ?? 0;
    const threshold = product?.lowStockThreshold ?? 5;
    return stock > 0 && stock <= threshold;
  }

  calculateDiscount(product: IProduct | null): number | null {
    if (!product?.price || !product?.costPrice || product.costPrice >= product.price) return null;
    return Math.round(((product.price - product.costPrice) / product.price) * 100);
  }
}
