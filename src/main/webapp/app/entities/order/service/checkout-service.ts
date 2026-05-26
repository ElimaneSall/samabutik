// checkout.service.ts
import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { IOrder, NewOrder } from '../order.model';
import { OrderService } from '../service/order.service';
import { PaymentMethod } from '../../enumerations/payment-method.model';
import { OrderItemService } from '../../order-item/service/order-item.service';
import { IOrderItem } from '../../order-item/order-item.model';

export type CheckoutStep = 1 | 2 | 3;

@Injectable({ providedIn: 'root' })
export class CheckoutService {
  private readonly router = inject(Router);
  private readonly orderService = inject(OrderService);
  private readonly orderItemService = inject(OrderItemService);

  // State
  readonly currentStep = signal<CheckoutStep>(1);
  readonly order = signal<IOrder | null>(null);
  readonly items = signal<IOrderItem[]>([]);
  readonly isLoading = signal(false);
  readonly shippingAddress = signal('');
  readonly deliveryNote = signal('');
  readonly selectedPaymentMethod = signal<PaymentMethod | null>(null);
  readonly phoneNumber = signal('');

  // Computed values
  readonly subtotal = computed(() => {
    return this.items().reduce((sum, item) => sum + (item.subtotal ?? 0), 0);
  });

  readonly shippingCost = signal(1000);

  readonly total = computed(() => {
    return this.subtotal() + this.shippingCost();
  });

  initializeCheckout(order: IOrder, items: IOrderItem[]): void {
    this.order.set(order);
    this.items.set(items);
    this.shippingAddress.set(order.shippingAddress || '');
    this.deliveryNote.set(order.deliveryNote || '');
    this.currentStep.set(1);
  }

  async nextStep(): Promise<void> {
    const step = this.currentStep();

    if (step === 1) {
      this.isLoading.set(true);
      await this.saveShippingInfo();
      this.isLoading.set(false);
      this.currentStep.set(2);
      this.router.navigate(['/checkout'], { queryParams: { step: 2, orderId: this.order()?.id } });
    } else if (step === 2) {
      this.currentStep.set(3);
      this.router.navigate(['/checkout'], { queryParams: { step: 3, orderId: this.order()?.id } });
    } else if (step === 3) {
      await this.processPayment();
    }
  }

  previousStep(): void {
    const step = this.currentStep();
    if (step > 1) {
      this.currentStep.set((step - 1) as CheckoutStep);
      this.router.navigate(['/checkout'], { queryParams: { step: step - 1, orderId: this.order()?.id } });
    }
  }

  private async saveShippingInfo(): Promise<void> {
    const currentOrder = this.order();
    if (currentOrder?.id) {
      return new Promise(resolve => {
        this.orderService.updateShippingInfo(currentOrder.id!, this.shippingAddress(), this.deliveryNote()).subscribe({
          next: res => {
            this.order.set(res);
            resolve();
          },
          error: err => {
            console.error('Erreur mise à jour livraison:', err);
            resolve();
          },
        });
      });
    }
  }

  private async processPayment(): Promise<void> {
    this.isLoading.set(true);
    const currentOrder = this.order();

    if (currentOrder?.id) {
      // Mettre à jour le mode de paiement
      await new Promise(resolve => {
        this.orderService.updatePaymentInfo(currentOrder.id!, this.selectedPaymentMethod()!, this.phoneNumber()).subscribe({
          next: res => {
            this.order.set(res);
            resolve(null);
          },
          error: err => {
            console.error('Erreur mise à jour paiement:', err);
            resolve(null);
          },
        });
      });

      // Finaliser la commande
      this.orderService.finalizeOrder(currentOrder.id!).subscribe({
        next: res => {
          this.order.set(res);
          this.isLoading.set(false);
          this.router.navigate(['/order', currentOrder.id, 'success']);
        },
        error: err => {
          console.error('Erreur finalisation commande:', err);
          this.isLoading.set(false);
        },
      });
    }
  }

  loadCheckoutFromStorage(orderId: number): void {
    this.isLoading.set(true);
    this.orderService.findWithItems(orderId).subscribe({
      next: ({ order, items }) => {
        this.order.set(order);
        this.items.set(items);
        this.shippingAddress.set(order.shippingAddress || '');
        this.deliveryNote.set(order.deliveryNote || '');
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.router.navigate(['/cart']);
      },
    });
  }

  getCartAndStartCheckout(): void {
    this.isLoading.set(true);
    this.orderService.getActiveCart().subscribe({
      next: cart => {
        if (cart && cart.id) {
          this.orderService.getOrderItems(cart.id).subscribe({
            next: items => {
              this.initializeCheckout(cart, items);
              this.isLoading.set(false);
              this.router.navigate(['/checkout'], { queryParams: { step: 1, orderId: cart.id } });
            },
            error: () => {
              this.isLoading.set(false);
              this.router.navigate(['/order']);
            },
          });
        } else {
          this.isLoading.set(false);
          this.router.navigate(['/order']);
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.router.navigate(['/order']);
      },
    });
  }
}
