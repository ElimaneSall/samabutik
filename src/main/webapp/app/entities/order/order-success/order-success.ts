import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { OrderService } from '../service/order.service';
import { IOrder } from '../order.model';
import { OrderItemService } from '../../order-item/service/order-item.service';
import { IOrderItem } from '../../order-item/order-item.model';

@Component({
  selector: 'jhi-order-success',
  templateUrl: './order-success.html',
  styleUrl: './order-success.scss',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, RouterLink],
})
export class OrderSuccess implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly orderService = inject(OrderService);
  private readonly orderItemService = inject(OrderItemService);

  order: IOrder | null = null;
  items: IOrderItem[] = [];

  ngOnInit(): void {
    const orderId = this.route.snapshot.params['id'];
    if (orderId) {
      this.loadOrder(parseInt(orderId, 10));
    } else {
      this.router.navigate(['/']);
    }
  }

  loadOrder(id: number): void {
    this.orderService.find(id).subscribe({
      next: res => {
        this.order = res;
        if (this.order) {
          this.orderItemService.query({ 'order.id.equals': this.order.id }).subscribe({
            next: itemsRes => (this.items = itemsRes.body || []),
          });
        }
      },
      error: () => this.router.navigate(['/']),
    });
  }

  getMediaUrl(url: string | null | undefined): string {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `http://localhost:8080${url}`;
  }
}
