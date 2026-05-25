// pack-detail.ts
import { Component, input, signal, computed, effect } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule, DecimalPipe } from '@angular/common';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslateModule } from '@ngx-translate/core';
import { IPack } from '../pack.model';
import dayjs from 'dayjs';

interface ImageItem {
  id: number | null;
  url: string | null | undefined;
  isMain: boolean;
}

@Component({
  selector: 'jhi-pack-detail',
  templateUrl: './pack-detail.html',
  styleUrl: './pack-detail.css',
  imports: [CommonModule, DecimalPipe, FontAwesomeModule, TranslateModule, RouterLink],
})
export class PackDetail {
  readonly pack = input<IPack | null>(null);
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
    const p = this.pack();
    if (!p) return [];

    const images: ImageItem[] = [];

    // Main image first
    if (p.mainMedia?.url) {
      images.push({ id: p.mainMedia.id ?? null, url: p.mainMedia.url, isMain: true });
    }

    // Gallery images
    if (p.galleries) {
      for (const media of p.galleries) {
        if (media.url && !images.find(img => img.id === media.id)) {
          images.push({ id: media.id ?? null, url: media.url, isMain: false });
        }
      }
    }

    // Fallback: use first product image from pack items if no pack images
    if (images.length === 0 && p.packItems && p.packItems.length > 0) {
      const firstProduct = p.packItems[0].product;
      if (firstProduct?.mainMedia?.url) {
        images.push({ id: firstProduct.mainMedia.id ?? null, url: firstProduct.mainMedia.url, isMain: true });
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

  // Computed: pack items list
  readonly packItems = computed(() => this.pack()?.packItems || []);

  // Computed: original total price
  readonly originalTotalPrice = computed(() => {
    const items = this.packItems();
    return items.reduce((sum, item) => sum + (item.product?.price ?? 0) * (item.quantity ?? 1), 0);
  });

  // Computed: discount amount
  readonly discountAmount = computed(() => {
    const packData = this.pack();
    if (!packData) return 0;

    const originalPrice = this.originalTotalPrice();
    const discountType = packData.discountType;
    const discountValue = Number(packData.discountValue ?? 0);

    if (discountType === 'PERCENT') {
      return Math.round(originalPrice * (discountValue / 100));
    } else if (discountType === 'FIXED') {
      return discountValue;
    }
    return 0;
  });

  // Computed: final price
  readonly finalPrice = computed(() => {
    return Math.max(0, this.originalTotalPrice() - this.discountAmount());
  });

  // Computed: discount percent for badge
  readonly discountPercent = computed(() => {
    const original = this.originalTotalPrice();
    if (original === 0) return 0;
    return Math.round((this.discountAmount() / original) * 100);
  });

  readonly isActiveAndValid = computed(() => {
    const p = this.pack();
    if (!p) return false;
    if (!p.isActive) return false;

    const now = dayjs();
    const startDate = p.startDate ? dayjs(p.startDate) : null;
    const endDate = p.endDate ? dayjs(p.endDate) : null;

    if (startDate && startDate.isAfter(now)) return false;
    if (endDate && endDate.isBefore(now)) return false;

    return true;
  });

  // Dans le computed timeRemaining
  readonly timeRemaining = computed(() => {
    const p = this.pack();
    if (!p || !p.endDate) return null;

    const endDate = dayjs(p.endDate);
    const now = dayjs();

    if (endDate.isBefore(now)) return 'Offre terminée';

    const diffDays = endDate.diff(now, 'day');

    if (diffDays === 0) return "Se termine aujourd'hui";
    if (diffDays === 1) return 'Se termine demain';
    return `${diffDays} jours restants`;
  });

  constructor() {
    // Reset index when pack changes
    effect(() => {
      this.pack(); // track
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
      this.nextImage();
    } else {
      this.previousImage();
    }
  }

  // === HELPERS ===

  getMediaUrl(url: string | null | undefined): string {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${this.serverApiUrl}${url}`;
  }

  getDiscountTypeLabel(type: string | null | undefined): string {
    if (type === 'PERCENT') return 'Pourcentage';
    if (type === 'FIXED') return 'Montant fixe';
    return 'Non défini';
  }
  formatDate(date: dayjs.Dayjs | null | undefined): string {
    if (!date) return 'Non définie';
    return date.format('DD/MM/YYYY');
  }
}
