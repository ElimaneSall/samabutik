// pack-carousel.ts
import { Component, input, output, signal, computed, effect, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Router } from '@angular/router';
import dayjs from 'dayjs/esm';
import { IPack } from '../pack.model';

type CarouselVariant = 'hero' | 'compact';

@Component({
  selector: 'jhi-pack-carousel',
  templateUrl: './pack-carousel.html',
  styleUrls: ['./pack-carousel.scss'],
  standalone: true,
  imports: [CommonModule, DecimalPipe, FontAwesomeModule],
})
export class PackCarousel implements OnInit, OnDestroy {
  readonly packs = input<IPack[]>([]);
  readonly variant = input<CarouselVariant>('hero');
  readonly autoPlay = input(true);
  readonly autoPlayInterval = input(5000);
  readonly packClick = output<IPack>();

  readonly currentSlide = signal(0);
  readonly isPaused = signal(false);
  private autoPlayTimer: ReturnType<typeof setInterval> | null = null;

  constructor(private readonly router: Router) {}

  ngOnInit(): void {
    console.log('🔁 PackCarousel initialisé, packs:', this.packs().length);
    if (this.autoPlay() && this.packs().length > 1) {
      this.startAutoPlay();
    }
  }

  ngOnDestroy(): void {
    this.stopAutoPlay();
  }

  private startAutoPlay(): void {
    this.stopAutoPlay();
    if (this.packs().length <= 1) return;
    this.autoPlayTimer = setInterval(() => {
      if (!this.isPaused()) {
        this.nextSlide();
      }
    }, this.autoPlayInterval());
  }

  private stopAutoPlay(): void {
    if (this.autoPlayTimer) {
      clearInterval(this.autoPlayTimer);
      this.autoPlayTimer = null;
    }
  }

  pauseAutoPlay(): void {
    this.isPaused.set(true);
  }

  resumeAutoPlay(): void {
    this.isPaused.set(false);
  }

  nextSlide(event?: Event): void {
    event?.stopPropagation();
    const total = this.packs().length;
    if (total <= 1) return;
    this.currentSlide.update(idx => (idx + 1) % total);
  }

  previousSlide(event?: Event): void {
    event?.stopPropagation();
    const total = this.packs().length;
    if (total <= 1) return;
    this.currentSlide.update(idx => (idx - 1 + total) % total);
  }

  goToSlide(index: number, event?: Event): void {
    event?.stopPropagation();
    if (index < 0 || index >= this.packs().length) return;
    this.currentSlide.set(index);
  }

  onPackClick(pack: IPack, event: Event): void {
    event.stopPropagation();
    this.packClick.emit(pack);
    this.router.navigate(['/pack', pack.id, 'view']);
  }

  getSlideImage(pack: IPack): string | null {
    if (pack.mainMedia?.url) {
      return this.getMediaUrl(pack.mainMedia.url);
    }
    const firstItem = pack.packItems?.[0];
    if (firstItem?.product?.mainMedia?.url) {
      return this.getMediaUrl(firstItem.product.mainMedia.url);
    }
    return null;
  }

  isPackActive(pack: IPack): boolean {
    if (!pack.isActive) return false;
    if (!pack.endDate) return true;
    return dayjs(pack.endDate).isAfter(dayjs());
  }

  getMediaUrl(url: string | null | undefined): string {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `http://localhost:8080${url}`;
  }

  calculateOriginalPrice(pack: IPack): number {
    if (!pack.packItems?.length) return 0;
    return pack.packItems.reduce((sum, item) => {
      const price = item.product?.price ?? 0;
      const qty = item.quantity ?? 1;
      return sum + price * qty;
    }, 0);
  }

  calculateFinalPrice(pack: IPack): number {
    const original = this.calculateOriginalPrice(pack);
    if (!pack.discountValue || original === 0) return original;

    if (pack.discountType === 'PERCENT') {
      return Math.round(original * (1 - pack.discountValue / 100));
    } else {
      return Math.max(0, original - pack.discountValue);
    }
  }

  calculateDiscountPercent(pack: IPack): number {
    const original = this.calculateOriginalPrice(pack);
    const final = this.calculateFinalPrice(pack);
    if (original === 0 || final >= original) return 0;
    return Math.round(((original - final) / original) * 100);
  }

  getDaysLeft(endDate: dayjs.Dayjs | string | null | undefined): number {
    if (!endDate) return 0;
    const end = dayjs(endDate).toDate();
    const now = new Date();
    if (isNaN(end.getTime())) return 0;
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  }
}
