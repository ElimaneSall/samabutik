import { Component, inject, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CheckoutStep, PaymentMethod } from '../../order-checkout.model';
import { OrderCheckoutService } from '../../service/order-checkout';
import { ToastService } from '../../../../shared/notification/toast.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'jhi-order-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  templateUrl: './order-checkout.html',
  styleUrls: ['./order-checkout.css'],
})
export class OrderCheckout implements OnInit {
  protected readonly checkoutService = inject(OrderCheckoutService);
  private readonly route = inject(ActivatedRoute);
  public readonly router = inject(Router);
  protected readonly PaymentMethod = PaymentMethod;
  protected readonly CheckoutStep = CheckoutStep;

  readonly shippingAddress = signal('');
  readonly deliveryNote = signal('');
  readonly phoneNumber = signal('');
  readonly selectedPayment = signal<PaymentMethod | null>(null);

  readonly currentStep = this.checkoutService.currentStep;
  readonly order = this.checkoutService.order;
  readonly isLoading = this.checkoutService.isLoading;
  readonly items = this.checkoutService.items;
  private readonly toastService = inject(ToastService);

  constructor() {
    effect(() => {
      const state = this.checkoutService.state();
      if (state?.order) {
        this.shippingAddress.set(state.order.shippingAddress || '');
        this.deliveryNote.set(state.order.deliveryNote || '');
        this.phoneNumber.set(state.order.phoneNumber || '');
        this.selectedPayment.set(state.order.paymentMethod || null);
      }
    });
  }

  ngOnInit(): void {
    const orderId = this.route.snapshot.queryParams['orderId'];
    this.checkoutService.initializeCheckout(orderId);
  }

  nextStep(): void {
    if (this.currentStep() === CheckoutStep.SUMMARY) {
      if (this.items().length === 0) {
        this.toastService.warning('Votre panier est vide');
        return;
      }
      this.checkoutService.nextStep();
    } else if (this.currentStep() === CheckoutStep.SHIPPING) {
      if (!this.shippingAddress().trim()) {
        this.toastService.warning('Veuillez entrer une adresse de livraison');
        return;
      }
      this.checkoutService.updateShippingAddress(this.shippingAddress(), this.deliveryNote() || undefined);
      this.checkoutService.nextStep();
    } else if (this.currentStep() === CheckoutStep.PAYMENT) {
      if (!this.selectedPayment() || !this.phoneNumber().trim()) {
        this.toastService.warning('Veuillez choisir un moyen de paiement');
        return;
      }
      this.checkoutService.updatePaymentMethod(this.selectedPayment()!, this.phoneNumber());
      this.checkoutService.nextStep();
    }
  }

  confirmOrder(): void {
    if (!this.selectedPayment() || !this.phoneNumber().trim()) {
      this.toastService.warning('Veuillez choisir un moyen de paiement');
      return;
    }

    this.checkoutService.updatePaymentMethod(this.selectedPayment()!, this.phoneNumber());

    this.checkoutService.confirmOrder().subscribe({
      next: res => {
        const orderId = res.body?.id;
        this.toastService.success('Commande confirmée avec succès');
        this.router.navigate(['/order/tracking', orderId]);
      },
      error: err => {
        console.error('Error confirming order:', err);
        this.toastService.error('Erreur lors de la confirmation');
      },
    });
  }

  canProceed(): boolean {
    const step = this.currentStep();
    if (step === CheckoutStep.SUMMARY) {
      return this.items().length > 0;
    }
    if (step === CheckoutStep.SHIPPING) {
      return this.shippingAddress().trim().length > 0;
    }
    if (step === CheckoutStep.PAYMENT) {
      return !!this.selectedPayment() && this.phoneNumber().trim().length >= 9;
    }
    return true;
  }

  getButtonText(): string {
    const step = this.currentStep();
    if (step === CheckoutStep.PAYMENT) {
      return 'Confirmer la commande';
    }
    if (step === CheckoutStep.VALIDATION) {
      return 'Traitement...';
    }
    return 'Continuer';
  }

  getStepClass(step: CheckoutStep): string {
    const current = this.currentStep();
    if (step < current) return 'completed bg-primary text-white';
    if (step === current) return 'active bg-primary-container text-on-primary-container border-2 border-primary';
    return 'pending bg-surface-variant text-on-surface-variant';
  }
  formatPrice(amount: number): string {
    return this.checkoutService.formatPrice(amount);
  }
}
