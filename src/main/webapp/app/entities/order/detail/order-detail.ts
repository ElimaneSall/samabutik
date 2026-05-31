import { Component, OnInit, inject, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { OrderService } from '../service/order.service';
import { IOrder } from '../order.model';
import { OrderItemService } from '../../order-item/service/order-item.service';
import { IOrderItem } from '../../order-item/order-item.model';
import FormatMediumDatetimePipe from 'app/shared/date/format-medium-datetime.pipe';

type TimelineStep = {
  label: string;
  status: 'completed' | 'active' | 'pending';
  time?: string;
  icon: string;
};

@Component({
  selector: 'jhi-order-detail',
  templateUrl: './order-detail.html',
  styleUrl: './order-detail.scss',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, RouterLink, DecimalPipe, FormatMediumDatetimePipe],
})
export class OrderDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  public readonly router = inject(Router);
  private readonly orderService = inject(OrderService);
  private readonly orderItemService = inject(OrderItemService);
  private readonly cdr = inject(ChangeDetectorRef); // ✅ AJOUTÉ

  order: IOrder | null = null;
  items: IOrderItem[] = [];
  timelineSteps: TimelineStep[] = [];

  getMediaUrl(url: string | null | undefined): string {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `http://localhost:8080${url}`;
  }

  ngOnInit(): void {
    const orderId = this.route.snapshot.params['id'];
    if (orderId) {
      this.loadOrder(parseInt(orderId, 10));
    } else {
      this.router.navigate(['/order']);
    }
  }

  loadOrder(id: number): void {
    this.orderService.find(id).subscribe({
      next: res => {
        this.order = res;
        if (this.order) {
          this.buildTimeline();
          this.loadItems(this.order.id!);
        }
        this.cdr.detectChanges(); // ✅ FORCER LA DÉTECTION
      },
      error: () => this.router.navigate(['/order']),
    });
  }

  // ✅ EXTRAIRE le chargement des items dans une méthode séparée
  private loadItems(orderId: number): void {
    this.orderItemService.query({ orderId: orderId }).subscribe({
      next: itemsRes => {
        this.items = itemsRes.body || [];
        this.cdr.detectChanges(); // ✅ FORCER LA DÉTECTION
      },
    });
  }

  buildTimeline(): void {
    const status = this.order?.status;

    // ✅ CRÉER UN NOUVEAU TABLEAU (pas de mutation)
    const steps: TimelineStep[] = [
      {
        label: 'Commande reçue',
        status: 'pending',
        icon: 'receipt',
        time: this.order?.deliveredAt ? this.order.deliveredAt.toString() : undefined,
      },
      {
        label: 'Paiement validé',
        status: 'pending',
        icon: 'credit-card',
        time: this.order?.deliveredAt ? this.order.deliveredAt.toString() : undefined,
      },
      { label: 'Préparation', status: 'pending', icon: 'box-open' },
      { label: 'En livraison', status: 'pending', icon: 'truck' },
      { label: 'Livrée', status: 'pending', icon: 'check-circle' },
    ];

    const statusMap: Record<string, number> = {
      PENDING: 0,
      PAID: 1,
      PREPARING: 2,
      SHIPPED: 3,
      DELIVERED: 4,
      CANCELLED: -1,
    };

    const activeIndex = statusMap[status || 'PENDING'] ?? 0;
    if (activeIndex === -1) {
      steps[0].status = 'completed';
      this.timelineSteps = [...steps]; // ✅ NOUVELLE RÉFÉRENCE
      return;
    }

    for (let i = 0; i < steps.length; i++) {
      if (i < activeIndex) {
        steps[i].status = 'completed';
      } else if (i === activeIndex) {
        steps[i].status = 'active';
      }
    }

    this.timelineSteps = [...steps]; // ✅ NOUVELLE RÉFÉRENCE (spread operator)
  }

  getTimelineProgress(): number {
    const completed = this.timelineSteps.filter(s => s.status === 'completed').length;
    const total = this.timelineSteps.length - 1;
    if (total <= 0) return 0;
    return (completed / total) * 100;
  }

  getStatusClass(): string {
    const status = this.order?.status;
    const classes: Record<string, string> = {
      PENDING: 'bg-orange-50 text-orange-600 border border-orange-200',
      PAID: 'bg-blue-50 text-blue-600 border border-blue-200',
      PREPARING: 'bg-indigo-50 text-indigo-600 border border-indigo-200',
      SHIPPED: 'bg-purple-50 text-purple-600 border border-purple-200',
      DELIVERED: 'bg-emerald-50 text-emerald-600 border border-emerald-200',
      CANCELLED: 'bg-red-50 text-red-600 border border-red-200',
    };
    return classes[status || 'PENDING'] || classes['PENDING'];
  }

  getStatusLabel(): string {
    const status = this.order?.status;
    const labels: Record<string, string> = {
      PENDING: 'En attente',
      PAID: 'Payée',
      PREPARING: 'Préparation',
      SHIPPED: 'Expédiée',
      DELIVERED: 'Livrée',
      CANCELLED: 'Annulée',
    };
    return labels[status || 'PENDING'] || 'En attente';
  }

  getPaymentStatusClass(): string {
    const status = this.order?.paymentStatus;
    const classes: Record<string, string> = {
      PENDING: 'bg-orange-50 text-orange-600 border border-orange-200',
      SUCCESS: 'bg-emerald-50 text-emerald-600 border border-emerald-200',
      FAILED: 'bg-red-50 text-red-600 border border-red-200',
      REFUNDED: 'bg-slate-50 text-slate-600 border border-slate-200',
    };
    return classes[status || 'PENDING'] || classes['PENDING'];
  }

  getPaymentStatusLabel(): string {
    const status = this.order?.paymentStatus;
    const labels: Record<string, string> = {
      PENDING: 'En attente',
      SUCCESS: 'Réussi',
      FAILED: 'Échoué',
      REFUNDED: 'Remboursé',
    };
    return labels[status || 'PENDING'] || 'En attente';
  }

  openWhatsApp(): void {
    const phone = '221770000000';
    const message = encodeURIComponent(`Bonjour, j'ai une question concernant ma commande #${this.order?.orderNumber || ''}`);
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  }
  // Détection mobile/desktop
  isMobile = window.innerWidth < 1024;

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.isMobile = (event.target as Window).innerWidth < 1024;
    this.cdr.detectChanges();
  }

  // Helper pour les messages actifs du timeline desktop
  getActiveStepMessage(label: string): string {
    const messages: Record<string, string> = {
      Préparation: "L'équipe prépare vos articles...",
      'En livraison': 'Le livreur est en route !',
    };
    return messages[label] || 'En cours...';
  }
}
