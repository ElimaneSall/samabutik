import { Component, inject, OnInit, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { OrderCheckoutService } from '../../service/order-checkout';
import { ToastService } from '../../../../shared/notification/toast.service';

@Component({
  selector: 'jhi-order-validation',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule, RouterLink],
  templateUrl: './order-validation.html',
  styleUrls: ['./order-validation.css'],
})
export class OrderValidation implements OnInit, OnDestroy {
  private readonly checkoutService = inject(OrderCheckoutService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly toastService = inject(ToastService);

  readonly order = this.checkoutService.order;
  readonly items = this.checkoutService.items;
  readonly isLoading = signal(true);
  readonly timeLeft = signal(165);
  readonly showErrorDetails = signal(false);
  readonly validationStatus = signal<'waiting' | 'success' | 'failed' | 'expired'>('waiting');

  private countdownInterval: any;
  private statusCheckInterval: any;

  ngOnInit(): void {
    const orderId = this.route.snapshot.queryParams['orderId'];
    if (orderId) {
      this.checkoutService.loadOrder(Number(orderId));
    }
    this.startCountdown();
    this.startStatusCheck();

    setTimeout(() => {
      this.isLoading.set(false);
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.countdownInterval) clearInterval(this.countdownInterval);
    if (this.statusCheckInterval) clearInterval(this.statusCheckInterval);
  }

  private startCountdown(): void {
    this.countdownInterval = setInterval(() => {
      this.timeLeft.update(t => {
        if (t <= 1) {
          clearInterval(this.countdownInterval);
          this.validationStatus.set('expired');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }

  private startStatusCheck(): void {
    this.statusCheckInterval = setInterval(() => {
      const currentOrder = this.order();
      if (currentOrder?.paymentStatus === 'SUCCESS') {
        this.validationStatus.set('success');
        clearInterval(this.statusCheckInterval);
        clearInterval(this.countdownInterval);
        this.isLoading.set(false);
      }
    }, 3000);
  }

  getFormattedTime(): string {
    const minutes = Math.floor(this.timeLeft() / 60);
    const seconds = this.timeLeft() % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  getPaymentInstructions(): { steps: string[]; app: string } {
    const order = this.order();
    const amount = order?.totalAmount || 0;
    const formattedAmount = this.checkoutService.formatPrice(amount);

    if (order?.paymentMethod === 'WAVE') {
      return {
        steps: [
          `Ouvrez votre application <strong>Wave</strong>`,
          `Validez la transaction de <strong class="text-primary">${formattedAmount}</strong>`,
          `Revenez ici, la confirmation sera automatique`,
        ],
        app: 'Wave',
      };
    } else {
      return {
        steps: [
          `Ouvrez votre application <strong>Orange Money</strong>`,
          `Validez la transaction de <strong class="text-primary">${formattedAmount}</strong>`,
          `Revenez ici, la confirmation sera automatique`,
        ],
        app: 'Orange Money',
      };
    }
  }

  copyOrderNumber(): void {
    const orderNumber = this.order()?.orderNumber;
    if (orderNumber) {
      navigator.clipboard.writeText(orderNumber);
      this.toastService.success('Numéro de commande copié');
    }
  }

  simulateSuccess(): void {
    this.validationStatus.set('success');
    clearInterval(this.countdownInterval);
    clearInterval(this.statusCheckInterval);
    this.isLoading.set(false);
  }

  goToTracking(): void {
    const orderId = this.order()?.id;
    if (orderId) {
      this.router.navigate(['/order/tracking', orderId]);
    }
  }

  contactSupport(): void {
    window.open('https://wa.me/221771234567?text=Bonjour%20SamaButik%2C%20j%27ai%20besoin%20d%27aide', '_blank');
  }

  browseProducts(): void {
    this.router.navigate(['/product']);
  }

  toggleErrorDetails(): void {
    this.showErrorDetails.update(v => !v);
  }

  get primaryAction(): { label: string; action: () => void } | null {
    if (this.validationStatus() === 'success') {
      return { label: 'Suivre ma commande', action: () => this.goToTracking() };
    }
    if (this.validationStatus() === 'failed') {
      return { label: 'Réessayer le paiement', action: () => this.router.navigate(['/order/checkout']) };
    }
    return null;
  }

  get secondaryActions(): Array<{ label: string; action: () => void; variant: 'outline' | 'text' }> {
    if (this.validationStatus() === 'failed') {
      return [
        { label: 'Contacter le support', action: () => this.contactSupport(), variant: 'outline' },
        { label: 'Voir les produits', action: () => this.browseProducts(), variant: 'text' },
      ];
    }
    return [];
  }

  formatPrice(amount: number): string {
    return this.checkoutService.formatPrice(amount);
  }
}
