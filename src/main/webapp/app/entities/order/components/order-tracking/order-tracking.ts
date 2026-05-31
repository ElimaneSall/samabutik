import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { OrderCheckoutService } from '../../service/order-checkout';
import { ToastService } from '../../../../shared/notification/toast.service';
import { OrderStatus } from '../../../enumerations/order-status.model';

interface TimelineStep {
  title: string;
  description: string;
  timestamp?: string;
  completed: boolean;
  active: boolean;
  icon: string;
}

@Component({
  selector: 'jhi-order-tracking',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule, RouterLink],
  templateUrl: './order-tracking.html',
  styleUrls: ['./order-tracking.css'],
})
export class OrderTracking implements OnInit {
  private readonly checkoutService = inject(OrderCheckoutService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);

  readonly order = this.checkoutService.order;
  readonly isLoading = signal(true);
  readonly showItems = signal(false);
  readonly smsEnabled = signal(true);
  readonly trackingProgress = signal(0);

  timelineSteps: TimelineStep[] = [];

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const orderId = params['orderId'];
      if (orderId) {
        this.loadOrder(orderId);
      }
    });
  }

  private loadOrder(orderId: number): void {
    this.checkoutService.loadOrder(orderId);
    this.isLoading.set(false);
    this.buildTimeline();
  }

  private buildTimeline(): void {
    const order = this.order();
    const status = order?.status;

    this.timelineSteps = [
      {
        title: 'Commande reçue',
        description: 'Panier validé, paiement initié avec succès',
        timestamp: this.getOrderCreatedDate(),
        completed: true,
        active: false,
        icon: 'check',
      },
      {
        title: 'Paiement validé',
        description: 'Transaction confirmée par le système',
        timestamp: this.getPaymentDate(),
        completed: status !== OrderStatus.PENDING && status !== OrderStatus.CANCELLED,
        active: false,
        icon: 'check',
      },
      {
        title: 'En préparation',
        description: 'Nos équipes emballent vos articles avec soin',
        timestamp: this.getPreparationDate(),
        completed: status === OrderStatus.SHIPPED || status === OrderStatus.DELIVERED,
        active: status === OrderStatus.PREPARING,
        icon: 'package',
      },
      {
        title: 'En livraison',
        description: 'Votre colis est en route vers vous',
        timestamp: this.getShippingDate(),
        completed: status === OrderStatus.DELIVERED,
        active: status === OrderStatus.SHIPPED,
        icon: 'truck',
      },
      {
        title: 'Livrée',
        description: 'Colis livré avec succès',
        timestamp: this.getDeliveryDate(),
        completed: status === OrderStatus.DELIVERED,
        active: false,
        icon: 'check-double',
      },
    ];

    this.calculateProgress();
  }

  private calculateProgress(): void {
    const completedSteps = this.timelineSteps.filter(s => s.completed).length;
    const totalSteps = this.timelineSteps.length;
    this.trackingProgress.set((completedSteps / totalSteps) * 100);
  }

  private getOrderCreatedDate(): string {
    return '28/05 14:32';
  }

  private getPaymentDate(): string {
    return '28/05 14:33';
  }

  private getPreparationDate(): string {
    return "Aujourd'hui 15:30";
  }

  private getShippingDate(): string {
    return 'Demain';
  }

  private getDeliveryDate(): string {
    return 'Demain soir';
  }

  getOrderStatusText(): string {
    const status = this.order()?.status;
    switch (status) {
      case OrderStatus.PENDING:
        return 'EN ATTENTE';
      case OrderStatus.PREPARING:
        return 'EN PRÉPARATION';
      case OrderStatus.SHIPPED:
        return 'EN LIVRAISON';
      case OrderStatus.DELIVERED:
        return 'LIVRÉE';
      case OrderStatus.CANCELLED:
        return 'ANNULÉE';
      default:
        return 'EN PRÉPARATION';
    }
  }

  getOrderStatusClass(): string {
    const status = this.order()?.status;
    switch (status) {
      case OrderStatus.DELIVERED:
        return 'bg-secondary text-white';
      case OrderStatus.CANCELLED:
        return 'bg-error text-white';
      default:
        return 'bg-primary-fixed text-on-primary-fixed';
    }
  }

  getDeliveryEstimate(): string {
    const status = this.order()?.status;
    if (status === OrderStatus.DELIVERED) {
      return 'Livrée';
    }
    if (status === OrderStatus.SHIPPED) {
      return "Aujourd'hui";
    }
    return 'Demain après-midi';
  }

  getProgressWidth(): number {
    if (this.order()?.status === OrderStatus.DELIVERED) return 100;
    if (this.order()?.status === OrderStatus.SHIPPED) return 75;
    if (this.order()?.status === OrderStatus.PREPARING) return 50;
    if (this.order()?.status === OrderStatus.PENDING) return 25;
    return 0;
  }

  toggleSmsAlerts(): void {
    this.smsEnabled.update(v => !v);
    if (this.smsEnabled()) {
      this.toastService.success('Alertes SMS activées');
    } else {
      this.toastService.info('Alertes SMS désactivées');
    }
  }

  toggleShowItems(): void {
    this.showItems.update(v => !v);
  }

  contactDeliveryPerson(): void {
    window.open(
      'https://wa.me/221771234567?text=Bonjour%20Moussa%2C%20je%20suis%20le%20client%20de%20la%20commande%20' + this.order()?.orderNumber,
      '_blank',
    );
  }

  contactSupport(): void {
    window.open(
      'https://wa.me/221771234567?text=Bonjour%20SamaButik%2C%20j%27ai%20une%20question%20sur%20ma%20commande%20' +
        this.order()?.orderNumber,
      '_blank',
    );
  }

  modifyAddress(): void {
    this.toastService.info("Contactez le support pour modifier l'adresse");
  }

  copyOrderNumber(): void {
    const orderNumber = this.order()?.orderNumber;
    if (orderNumber) {
      navigator.clipboard.writeText(orderNumber);
      this.toastService.success('Numéro de commande copié');
    }
  }

  formatPrice(amount: number): string {
    return this.checkoutService.formatPrice(amount);
  }

  getTotalItems(): number {
    return this.checkoutService.items().length;
  }

  getItems(): any[] {
    return this.checkoutService.items();
  }
}
