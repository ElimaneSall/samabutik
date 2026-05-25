import { Component, input, signal, computed, effect } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule, DecimalPipe } from '@angular/common';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslateModule } from '@ngx-translate/core';
import { IProduct } from '../product.model';
import { IMedia } from '../../media/media.model';

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

  // === CAROUSEL STATE ===
  readonly currentImageIndex = signal(0);
  readonly isImageLoading = signal(false);

  // Touch swipe state
  private touchStartX = 0;
  private touchEndX = 0;
  private readonly SWIPE_THRESHOLD = 50;

  // Computed: all images (main + gallery)
  readonly allImages = computed<ImageItem[]>(() => {
    const p = this.product();
    if (!p) return [];

    const images: ImageItem[] = [];

    // Main image first
    if (p.mainMedia?.url) {
      images.push({ id: p.mainMedia.id ?? null, url: p.mainMedia.url, isMain: true });
    }

    // Gallery images
    if (p.gallery) {
      for (const media of p.gallery) {
        if (media.url && !images.find(img => img.id === media.id)) {
          images.push({ id: media.id ?? null, url: media.url, isMain: false });
        }
      }
    }

    return images;
  });

  // Computed: current image URL
  readonly currentImageUrl = computed<string>(() => {
    const images = this.allImages();
    const idx = this.currentImageIndex();
    if (images.length === 0) return '';
    if (idx >= images.length) return '';
    return this.getMediaUrl(images[idx].url);
  });

  // Computed: total images count
  readonly totalImages = computed(() => this.allImages().length);

  constructor() {
    // Reset index when product changes
    effect(() => {
      this.product(); // track
      this.currentImageIndex.set(0);
      this.isImageLoading.set(true);
    });
  }

  previousState(): void {
    globalThis.history.back();
  }

  // === CAROUSEL NAVIGATION ===

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

  // === IMAGE LOADING ===

  onImageLoad(): void {
    this.isImageLoading.set(false);
  }

  onImageError(): void {
    this.isImageLoading.set(false);
  }

  // === TOUCH SWIPE (Mobile) ===

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
      this.nextImage(); // Swipe left → next
    } else {
      this.previousImage(); // Swipe right → previous
    }
  }

  // === HELPERS ===

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
