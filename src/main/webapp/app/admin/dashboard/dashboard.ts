import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslateModule } from '@ngx-translate/core';

// Services & Entities JHipster
import { OrderService } from 'app/entities/order/service/order.service';
import { ProductService } from 'app/entities/product/service/product.service';
import { AccountService } from 'app/core/auth/account.service';
import { OrderStatus } from '../../entities/enumerations/order-status.model';

interface DashboardStats {
  dailyRevenue: number;
  revenueChange: number;
  pendingOrders: number;
  lowStockCount: number;
  lastStockUpdate: string;
}

interface WeeklySale {
  day: string;
  label: string;
  amount: number;
}

interface RecentOrder {
  id: string;
  number: string;
  customerName: string;
  customerInitials: string;
  amount: number;
  status: OrderStatus;
  date: string;
}

interface TopProduct {
  name: string;
  imageUrl: string | null;
  sales: number;
  revenue: number;
}

interface ActivityInsight {
  type: 'peak' | 'top-product' | 'alert';
  title: string;
  description: string;
  color: string;
}

@Component({
  selector: 'jhi-dashboard',
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  standalone: true,
  imports: [CommonModule, DecimalPipe, FontAwesomeModule, TranslateModule],
})
export default class Dashboard implements OnInit {
  // 🔹 Signals
  readonly stats = signal<DashboardStats>({
    dailyRevenue: 45000,
    revenueChange: 12,
    pendingOrders: 7,
    lowStockCount: 3,
    lastStockUpdate: 'il y a 5 min',
  });

  readonly weeklySales = signal<WeeklySale[]>([
    { day: 'Lun', label: 'Lundi', amount: 28000 },
    { day: 'Mar', label: 'Mardi', amount: 35000 },
    { day: 'Mer', label: 'Mercredi', amount: 42000 },
    { day: 'Jeu', label: 'Jeudi', amount: 31000 },
    { day: 'Ven', label: 'Vendredi', amount: 38000 },
    { day: 'Sam', label: 'Samedi', amount: 52000 },
    { day: 'Dim', label: 'Dimanche', amount: 45000 },
  ]);

  readonly recentOrders = signal<RecentOrder[]>([
    {
      id: '1',
      number: '#CMD-2024-001',
      customerName: 'Amadou Sow',
      customerInitials: 'AS',
      amount: 25500,
      status: OrderStatus.PENDING,
      date: '2024-01-15',
    },
    {
      id: '2',
      number: '#CMD-2024-002',
      customerName: 'Mariam Keita',
      customerInitials: 'MK',
      amount: 12000,
      status: OrderStatus.SHIPPED,
      date: '2024-01-15',
    },
    {
      id: '3',
      number: '#CMD-2024-003',
      customerName: 'Boubacar Diallo',
      customerInitials: 'BD',
      amount: 7500,
      status: OrderStatus.DELIVERED,
      date: '2024-01-14',
    },
    {
      id: '4',
      number: '#CMD-2024-004',
      customerName: 'Fatou Ndiaye',
      customerInitials: 'FN',
      amount: 18500,
      status: OrderStatus.PENDING,
      date: '2024-01-14',
    },
    {
      id: '5',
      number: '#CMD-2024-005',
      customerName: 'Ibrahim Touré',
      customerInitials: 'IT',
      amount: 32000,
      status: OrderStatus.CANCELLED,
      date: '2024-01-13',
    },
  ]);

  readonly insights = signal<ActivityInsight[]>([
    {
      type: 'peak',
      title: "Pic d'activité",
      description: 'Le plus grand nombre de ventes a été enregistré entre 18h et 20h hier.',
      color: '#c2410c',
    },
    {
      type: 'top-product',
      title: 'Top Produit',
      description: '"Chemise Wax Premium" est votre best-seller cette semaine.',
      color: '#059669',
    },
  ]);

  readonly topProduct = signal<TopProduct>({
    name: 'Sac Cuir Premium',
    imageUrl: '/content/images/top-product.jpg',
    sales: 47,
    revenue: 940000,
  });

  readonly isLoading = signal(false);
  readonly currentUser = signal<string>('Administrateur');

  // 🔹 Computed
  readonly maxWeeklySale = computed(() => {
    const sales = this.weeklySales();
    return Math.max(...sales.map(s => s.amount));
  });

  readonly totalWeeklyRevenue = computed(() => {
    return this.weeklySales().reduce((sum, s) => sum + s.amount, 0);
  });

  // 🔹 Injections
  private readonly router = inject(Router);
  private readonly orderService = inject(OrderService);
  private readonly productService = inject(ProductService);
  private readonly accountService = inject(AccountService);

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.isLoading.set(true);
    // TODO: Remplacer par des appels API réels
    // this.orderService.query({ size: 5, sort: ['createdDate,desc'] }).subscribe(...)
    // this.productService.query({ 'stock.lessThan': 10 }).subscribe(...)
    setTimeout(() => {
      this.isLoading.set(false);
    }, 500);
  }

  // 🔹 Helpers UI
  getStatusLabel(status: OrderStatus): string {
    const labels: Record<string, string> = {
      [OrderStatus.PENDING]: 'EN ATTENTE',
      [OrderStatus.PAID]: 'PAYÉE',
      [OrderStatus.SHIPPED]: 'EXPÉDIÉE',
      [OrderStatus.DELIVERED]: 'LIVRÉE',
      [OrderStatus.CANCELLED]: 'ANNULÉE',
    };
    return labels[status] ?? status;
  }

  getStatusColor(status: OrderStatus): string {
    const colors: Record<string, string> = {
      [OrderStatus.PENDING]: 'bg-amber-100 text-amber-700 border-amber-200',
      [OrderStatus.PAID]: 'bg-blue-100 text-blue-700 border-blue-200',
      [OrderStatus.SHIPPED]: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      [OrderStatus.DELIVERED]: 'bg-slate-100 text-slate-700 border-slate-200',
      [OrderStatus.CANCELLED]: 'bg-red-100 text-red-700 border-red-200',
    };
    return colors[status] ?? 'bg-slate-100 text-slate-700';
  }

  getStatusDot(status: OrderStatus): string {
    const dots: Record<string, string> = {
      [OrderStatus.PENDING]: 'bg-amber-500',
      [OrderStatus.PAID]: 'bg-blue-500',
      [OrderStatus.SHIPPED]: 'bg-emerald-500',
      [OrderStatus.DELIVERED]: 'bg-slate-500',
      [OrderStatus.CANCELLED]: 'bg-red-500',
    };
    return dots[status] ?? 'bg-slate-500';
  }

  getAvatarColor(initials: string): string {
    const colors = [
      'bg-orange-100 text-orange-700',
      'bg-emerald-100 text-emerald-700',
      'bg-blue-100 text-blue-700',
      'bg-purple-100 text-purple-700',
      'bg-rose-100 text-rose-700',
      'bg-amber-100 text-amber-700',
    ];
    let hash = 0;
    for (let i = 0; i < initials.length; i++) {
      hash = initials.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  getChartHeight(amount: number): string {
    const max = this.maxWeeklySale();
    const percentage = max > 0 ? (amount / max) * 100 : 0;
    return `${percentage}%`;
  }

  getChartPath(): string {
    const sales = this.weeklySales();
    if (sales.length === 0) return '';
    const max = this.maxWeeklySale();
    const width = 100;
    const height = 100;
    const stepX = width / (sales.length - 1);

    let path = `M 0 ${height - (sales[0].amount / max) * height}`;

    for (let i = 1; i < sales.length; i++) {
      const x = i * stepX;
      const y = height - (sales[i].amount / max) * height;
      const prevX = (i - 1) * stepX;
      const prevY = height - (sales[i - 1].amount / max) * height;
      const cp1x = prevX + stepX / 3;
      const cp1y = prevY;
      const cp2x = x - stepX / 3;
      const cp2y = y;
      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x} ${y}`;
    }

    return path;
  }

  getChartAreaPath(): string {
    const linePath = this.getChartPath();
    if (!linePath) return '';
    return `${linePath} L 100 100 L 0 100 Z`;
  }

  navigateToOrders(): void {
    this.router.navigate(['/order']);
  }

  navigateToOrderDetail(orderId: string): void {
    this.router.navigate(['/order', orderId, 'view']);
  }

  navigateToProducts(): void {
    this.router.navigate(['/product']);
  }

  navigateToCreateProduct(): void {
    this.router.navigate(['/product', 'new']);
  }

  navigateToCreatePromo(): void {
    this.router.navigate(['/pack', 'new']);
  }
}
