import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { OrderCheckoutService } from '../../service/order-checkout';
import { OrderItemDisplay } from '../../order-checkout.model';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'jhi-order-summary',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule, FontAwesomeModule],
  templateUrl: './order-summary.html',
  styleUrls: ['./order-summary.css'],
})
export class OrderSummary implements OnInit {
  private readonly checkoutService = inject(OrderCheckoutService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly items = computed(() => this.checkoutService.state()?.items ?? []);
  readonly order = this.checkoutService.order;
  readonly isLoading = this.checkoutService.isLoading;
  readonly isSheetOpen = signal(false);
  readonly selectedItem = signal<OrderItemDisplay | null>(null);
  readonly sheetQuantity = signal(1);

  ngOnInit(): void {
    const orderId = this.route.snapshot.queryParams['orderId'];
    this.checkoutService.initializeCheckout(orderId);
  }

  updateQuantity(item: OrderItemDisplay, delta: number): void {
    const newQty = Math.max(1, Math.min(item.stockAvailable ?? 99, item.quantity + delta));
    if (newQty !== item.quantity) {
      this.checkoutService.updateOrderItemQuantity(item.id, newQty);
    }
  }

  openQuantitySheet(item: OrderItemDisplay): void {
    this.selectedItem.set(item);
    this.sheetQuantity.set(item.quantity);
    this.isSheetOpen.set(true);
    document.body.style.overflow = 'hidden';
  }

  closeQuantitySheet(): void {
    this.isSheetOpen.set(false);
    document.body.style.overflow = '';
    setTimeout(() => this.selectedItem.set(null), 300);
  }

  decrementQuantity(): void {
    this.sheetQuantity.update(q => Math.max(1, q - 1));
  }

  incrementQuantity(): void {
    const maxStock = this.selectedItem()?.stockAvailable ?? 99;
    this.sheetQuantity.update(q => Math.min(maxStock, q + 1));
  }

  saveQuantityFromSheet(): void {
    const item = this.selectedItem();
    if (item && this.sheetQuantity() !== item.quantity) {
      this.checkoutService.updateOrderItemQuantity(item.id, this.sheetQuantity());
    }
    this.closeQuantitySheet();
  }

  removeItem(item: OrderItemDisplay): void {
    if (confirm(`Supprimer "${item.productName}" de la commande ?`)) {
      this.checkoutService.removeOrderItem(item.id);
      if (this.selectedItem()?.id === item.id) {
        this.closeQuantitySheet();
      }
    }
  }

  proceedToCheckout(): void {
    if (this.items().length > 0 && this.order()?.id) {
      this.router.navigate(['/order/checkout'], {
        queryParams: { orderId: this.order()?.id },
      });
    }
  }

  continueShopping(): void {
    this.router.navigate(['/product']);
  }

  formatPrice(amount: number): string {
    return this.checkoutService.formatPrice(amount);
  }

  clearAndRestart(): void {
    if (confirm('Annuler toute la commande ?')) {
      this.items().forEach(item => this.checkoutService.removeOrderItem(item.id));
    }
  }
}
