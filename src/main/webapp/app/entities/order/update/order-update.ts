import { ActivatedRoute, NavigationEnd, Router, RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslateModule } from '@ngx-translate/core';
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaymentMethod } from '../../enumerations/payment-method.model';
import { CheckoutService, CheckoutStep } from '../service/checkout-service';
import { filter, take } from 'rxjs';

@Component({
  selector: 'jhi-order-update',
  templateUrl: './order-update.html',
  styleUrl: './order-update.scss',
  imports: [CommonModule, FormsModule, FontAwesomeModule, TranslateModule],
  standalone: true,
})
export class OrderUpdate implements OnInit {
  private readonly checkoutService = inject(CheckoutService);
  private readonly route = inject(ActivatedRoute);
  protected readonly router = inject(Router);

  readonly currentStep = this.checkoutService.currentStep;
  readonly order = this.checkoutService.order;
  readonly items = this.checkoutService.items;
  readonly isLoading = this.checkoutService.isLoading;
  readonly shippingAddress = this.checkoutService.shippingAddress;
  readonly deliveryNote = this.checkoutService.deliveryNote;
  readonly selectedPaymentMethod = this.checkoutService.selectedPaymentMethod;
  readonly phoneNumber = this.checkoutService.phoneNumber;
  readonly subtotal = this.checkoutService.subtotal;
  readonly shippingCost = this.checkoutService.shippingCost;
  readonly total = this.checkoutService.total;

  readonly PaymentMethod = PaymentMethod;

  ngOnInit(): void {
    // Attendre que la navigation courante se termine avant d'exécuter la logique
    this.router.events
      .pipe(
        filter(e => e instanceof NavigationEnd),
        take(1),
      )
      .subscribe(() => {
        this.initializeCheckout();
      });
  }

  private initializeCheckout(): void {
    const orderId = this.route.snapshot.queryParams['orderId'];
    const step = parseInt(this.route.snapshot.queryParams['step'], 10) as CheckoutStep;

    if (orderId && !isNaN(step)) {
      this.checkoutService.loadCheckoutFromStorage(orderId);
      this.checkoutService.currentStep.set(step);
    } else if (orderId) {
      this.checkoutService.loadCheckoutFromStorage(orderId);
    } else {
      // Pas de race condition ici car on est déjà sur la route finale
      this.checkoutService.getCartAndStartCheckout();
    }
  }

  nextStep(): void {
    this.checkoutService.nextStep();
  }

  previousStep(): void {
    this.checkoutService.previousStep();
  }

  selectPaymentMethod(method: PaymentMethod): void {
    this.selectedPaymentMethod.set(method);
  }

  getStepClass(step: CheckoutStep): string {
    const current = this.currentStep();
    if (step < current) return 'completed';
    if (step === current) return 'active';
    return 'pending';
  }

  getMediaUrl(url: string | null | undefined): string {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `http://localhost:8080${url}`;
  }
}
