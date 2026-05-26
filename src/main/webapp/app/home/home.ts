// home.ts - Refactor complet avec Order/OrderItem + catégories dynamiques
import { Component, OnInit, inject, signal, computed, effect, afterNextRender } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule, DecimalPipe } from '@angular/common';
import dayjs from 'dayjs/esm';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslateModule } from '@ngx-translate/core';
import { HttpResponse, HttpHeaders } from '@angular/common/http';

// Entities & Services générés par JHipster
import { IProduct } from 'app/entities/product/product.model';
import { ProductService } from 'app/entities/product/service/product.service';
import { IPack } from 'app/entities/pack/pack.model';
import { PackService } from 'app/entities/pack/service/pack.service';
import { AccountService } from 'app/core/auth/account.service';
import { IOrder, NewOrder } from 'app/entities/order/order.model';
import { IOrderItem, NewOrderItem } from 'app/entities/order-item/order-item.model';
import { OrderService } from 'app/entities/order/service/order.service';
import { OrderItemService } from 'app/entities/order-item/service/order-item.service';
import { OrderStatus } from 'app/entities/enumerations/order-status.model';
import { PackCarousel } from '../entities/pack/pack-carousel/pack-carousel';

interface Category {
  id: string;
  name: string;
  isSelected?: boolean;
  count?: number;
}

@Component({
  selector: 'jhi-home',
  templateUrl: './home.html',
  styleUrl: './home.scss',
  standalone: true,
  imports: [CommonModule, DecimalPipe, FontAwesomeModule, TranslateModule, PackCarousel],
})
export default class Home implements OnInit {
  // 🔹 Données produits/packs
  readonly bestSellers = signal<IProduct[]>([]);
  readonly featuredPacks = signal<IPack[]>([]);
  readonly newArrivals = signal<IProduct[]>([]);
  readonly heroBannerUrl = signal<string | null>(null);
  readonly activeTab = signal('home');
  readonly isLoading = signal(true);

  // 🔹 Panier : computed depuis l'Order CART
  readonly cartCount = computed(() => {
    const items = this.cartItems();
    return items.reduce((sum, item) => sum + (item.quantity ?? 0), 0);
  });

  // 🔹 Signal pour les items du panier (mis à jour après chaque action)
  readonly cartItems = signal<IOrderItem[]>([]);
  readonly currentCartOrder = signal<IOrder | null>(null);

  // 🔹 Injections
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly productService = inject(ProductService);
  private readonly packService = inject(PackService);
  private readonly accountService = inject(AccountService);
  private readonly orderService = inject(OrderService); // ✅ Pour gérer le panier (Order CART)
  private readonly orderItemService = inject(OrderItemService); // ✅ Pour gérer les OrderItem
  readonly isReady = signal(false);
  readonly categoriesList = signal<Category[]>([]);

  constructor() {
    afterNextRender(() => {
      this.isReady.set(true);
    });
  }
  ngOnInit(): void {
    this.loadData();
    this.refreshCartState();
  }

  private loadData(): void {
    this.isLoading.set(true);

    // Best sellers
    this.productService
      .query({
        sort: ['id,desc'],
        size: 4,
        isActive: true,
      })
      .subscribe({
        next: (res: HttpResponse<IProduct[]>) => {
          this.bestSellers.set(res.body ?? []);
          this.setCategoriesFromProducts(res.body);
        },
        error: () => this.bestSellers.set([]),
      });

    // Featured packs
    this.packService
      .query({
        'displayOnHomepage.equals': true,
        'isActive.equals': true,
        'endDate.greaterThan': new Date().toISOString(),
        sort: ['discountValue,desc'],
        size: 5,
      })
      .subscribe({
        next: (res: HttpResponse<IPack[]>) => this.featuredPacks.set(res.body ?? []),
        error: () => this.featuredPacks.set([]),
      });

    // New arrivals
    this.productService
      .query({
        sort: ['id,desc'],
        size: 6,
        isActive: true,
      })
      .subscribe({
        next: (res: HttpResponse<IProduct[]>) => {
          this.newArrivals.set(res.body ?? []);
          this.isLoading.set(false);
        },
        error: () => {
          this.newArrivals.set([]);
          this.isLoading.set(false);
        },
      });
  }

  refreshCartState(): void {
    this.orderService
      .query({
        status: OrderStatus.PENDING,
        // 'customer.id.equals': currentUserId, // ← À ajouter si tu filtres par user
      })
      .subscribe({
        next: (res: HttpResponse<IOrder[]>) => {
          const cartOrder = res.body?.[0] ?? null;
          this.currentCartOrder.set(cartOrder);

          if (cartOrder?.id) {
            this.orderItemService
              .query({
                'order.id.equals': cartOrder.id,
              })
              .subscribe({
                next: (res: HttpResponse<IOrderItem[]>) => {
                  this.cartItems.set(res.body ?? []);
                },
                error: () => this.cartItems.set([]),
              });
          } else {
            this.cartItems.set([]);
          }
        },
        error: () => {
          this.currentCartOrder.set(null);
          this.cartItems.set([]);
        },
      });
  }

  // 🔹 Ajouter un produit au panier (via Order/OrderItem)
  addToCart(product: IProduct, event?: Event): void {
    event?.stopPropagation();
    if (!product.stock || product.stock <= 0) return;

    const addOrUpdateItem = (cartOrder: IOrder) => {
      // Vérifier si l'item existe déjà dans le panier
      const existingItem = this.cartItems().find(item => item.productSku === product.sku && !item.isPackItem);

      if (existingItem?.id) {
        // ✅ Mise à jour de quantité
        const newQuantity = (existingItem.quantity ?? 0) + 1;
        this.orderItemService
          .update({
            ...existingItem,
            quantity: newQuantity,
            subtotal: (existingItem.unitPrice ?? 0) * newQuantity,
          })
          .subscribe({
            next: () => {
              this.refreshCartState();
              // Optionnel: toast de succès
            },
            error: err => console.error('❌ Erreur mise à jour panier:', err),
          });
      } else {
        // ✅ Création d'un nouvel OrderItem
        const newItem: NewOrderItem = {
          id: null,
          productName: product.name,
          productSku: product.sku,
          quantity: 1,
          unitPrice: 1,
          subtotal: product.price ?? 0,
          isPackItem: false,
          productSnapshot: product,
          order: cartOrder,
        };

        this.orderItemService.create(newItem).subscribe({
          next: () => {
            this.refreshCartState();
          },
          error: err => console.error('❌ Erreur ajout au panier:', err),
        });
      }
    };

    const cartOrder = this.currentCartOrder();
    if (cartOrder?.id) {
      // Panier existe → ajouter l'item
      addOrUpdateItem(cartOrder);
    } else {
      // Pas de panier → en créer un nouveau d'abord
      const newCart: NewOrder = {
        id: null,
        status: OrderStatus.PENDING,
        currency: 'XOF',
        totalAmount: 0,
        shippingCost: 0,
        // customer: { id: currentUserId }, // ← Si nécessaire
      };

      this.orderService.create(newCart).subscribe({
        next: createdOrder => {
          this.currentCartOrder.set(createdOrder);
          addOrUpdateItem(createdOrder);
        },
        error: err => console.error('❌ Erreur création panier:', err),
      });
    }
  }

  // 🔹 Navigations
  navigateToProducts(): void {
    this.router.navigate(['/product']);
  }

  navigateToPacks(): void {
    this.router.navigate(['/pack']);
  }

  navigateToCategories(): void {
    this.router.navigate(['/product'], {
      queryParams: { view: 'categories' },
      queryParamsHandling: 'merge',
    });
  }

  navigateToProductDetail(product: IProduct): void {
    if (product.id) {
      this.router.navigate(['/product', product.id, 'view']);
    }
  }

  navigateToPackDetail(pack: IPack): void {
    if (pack.id) {
      this.router.navigate(['/pack', pack.id, 'view']);
    }
  }

  setActiveTab(tab: string): void {
    this.activeTab.set(tab);
    switch (tab) {
      case 'home':
        this.router.navigate(['/']);
        break;
      case 'categories':
        this.navigateToCategories();
        break;
      case 'cart':
        this.router.navigate(['/order']);
        break;
      case 'account':
        this.router.navigate(['/account']);
        break;
    }
  }

  // 🔹 Helpers UI
  getMediaUrl(url: string | null | undefined): string {
    if (!url) return '/content/images/no-image.png';
    if (url.startsWith('http')) return url;
    return `${window.location.origin}${url}`;
  }

  calculateDiscount(product: IProduct): number {
    const price = product.price;
    const cost = product.costPrice;
    if (!price || !cost || cost >= price) return 0;
    return Math.round(((price - cost) / price) * 100);
  }

  calculatePackOriginalPrice(pack: IPack): number {
    if (!pack.packItems?.length) return 0;
    return pack.packItems.reduce((sum, item) => {
      const productPrice = item.product?.price ?? 0;
      const quantity = item.quantity ?? 1;
      return sum + productPrice * quantity;
    }, 0);
  }

  calculatePackFinalPrice(pack: IPack): number {
    const original = this.calculatePackOriginalPrice(pack);
    const discountValue = pack.discountValue;
    if (!discountValue) return original;

    if (pack.discountType === 'PERCENT') {
      return Math.round(original * (1 - Number(discountValue) / 100));
    }
    return Math.max(0, original - Number(discountValue));
  }

  calculatePackDiscount(pack: IPack): number {
    const original = this.calculatePackOriginalPrice(pack);
    const final = this.calculatePackFinalPrice(pack);
    if (original === 0) return 0;
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
  // Alternative sans les .equals
  getTop5Pack(): void {
    const params = {
      displayOnHomepage: true,
      isActive: true,
      sort: ['id,desc'],
      size: 5,
    };

    this.packService.query(params).subscribe({
      next: (res: HttpResponse<IPack[]>) => {
        // Filtrer côté client si nécessaire
        const now = dayjs();
        const activePacks = (res.body ?? []).filter(
          pack => pack.isActive && pack.displayOnHomepage && (!pack.endDate || dayjs(pack.endDate).isAfter(now)),
        );
        this.featuredPacks.set(activePacks.slice(0, 5));
      },
      error: err => console.error('Erreur:', err),
    });
  }
  getPackProgress(pack: IPack): number {
    const startDate = pack.startDate;
    const endDate = pack.endDate;
    if (!startDate || !endDate) return 0;

    const start = dayjs(startDate).toDate();
    const end = dayjs(endDate).toDate();
    const now = new Date();
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;

    const total = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    if (total <= 0) return 100;

    const progress = (elapsed / total) * 100;
    return Math.min(100, Math.max(0, Math.round(progress * 100) / 100));
  }

  isPackAvailable(pack: IPack): boolean {
    if (!pack.packItems?.length) return false;
    return pack.packItems.every(item => (item.product?.stock ?? 0) >= (item.quantity ?? 1));
  }

  private readonly AVAILABLE_ICONS = ['folder', 'tag', 'shopping-bag', 'box', 'star', 'heart', 'bookmark', 'layer-group'];

  /**
   * Extrait les catégories uniques depuis le body des produits et met à jour le signal.
   * @param productsBody Le tableau de produits reçu de l'API
   */
  setCategoriesFromProducts(productsBody: any[] | null | undefined): void {
    if (!productsBody) {
      this.categoriesList.set([]);
      return;
    }

    const uniqueNames = [...new Set(productsBody.map(p => p.category).filter(Boolean) as string[])];

    const mappedCategories: Category[] = uniqueNames.map((name, index) => {
      return {
        id: `cat-${index + 1}-${Math.random().toString(36).substring(2, 5)}`, // ID unique
        name: name,
        count: productsBody.filter(p => p.category === name).length, // Optionnel
      };
    });

    this.categoriesList.set(mappedCategories);
  }

  // home.ts - Ajouter cette méthode
  addPackToCart(pack: IPack, event?: Event): void {
    event?.stopPropagation();

    // Vérifier la disponibilité de tous les produits du pack
    if (!this.isPackAvailable(pack)) return;

    const addOrUpdatePackItems = (cartOrder: IOrder) => {
      // Pour chaque produit dans le pack, l'ajouter au panier
      pack.packItems?.forEach(packItem => {
        const product = packItem.product;
        if (!product || !product.stock || product.stock <= 0) return;

        const quantity = packItem.quantity ?? 1;

        // Vérifier si l'item existe déjà
        const existingItem = this.cartItems().find(item => item.productSku === product.sku && !item.isPackItem);

        if (existingItem?.id) {
          // Mettre à jour la quantité
          const newQuantity = (existingItem.quantity ?? 0) + quantity;
          this.orderItemService
            .update({
              ...existingItem,
              quantity: newQuantity,
              subtotal: (existingItem.unitPrice ?? 0) * newQuantity,
            })
            .subscribe({
              next: () => this.refreshCartState(),
              error: err => console.error('❌ Erreur mise à jour panier:', err),
            });
        } else {
          // Créer un nouvel OrderItem
          const newItem: NewOrderItem = {
            id: null,
            productName: product.name,
            productSku: product.sku,
            quantity: quantity,
            unitPrice: product.price ?? 0,
            subtotal: (product.price ?? 0) * quantity,
            isPackItem: true,
            // packId: pack.id,
            // packName: pack.name,
            productSnapshot: product,
            order: cartOrder,
          };

          this.orderItemService.create(newItem).subscribe({
            next: () => this.refreshCartState(),
            error: err => console.error('❌ Erreur ajout pack au panier:', err),
          });
        }
      });
    };

    const cartOrder = this.currentCartOrder();
    if (cartOrder?.id) {
      addOrUpdatePackItems(cartOrder);
    } else {
      const newCart: NewOrder = {
        id: null,
        status: OrderStatus.PENDING,
        currency: 'XOF',
        totalAmount: 0,
        shippingCost: 0,
      };

      this.orderService.create(newCart).subscribe({
        next: createdOrder => {
          this.currentCartOrder.set(createdOrder);
          addOrUpdatePackItems(createdOrder);
        },
        error: err => console.error('❌ Erreur création panier:', err),
      });
    }
  }
  filterByCategory(selected: Category) {
    this.categoriesList.update(cats =>
      cats.map(cat => ({
        ...cat,
        isSelected: cat.id === selected.id ? !selected.isSelected : false,
      })),
    );
  }
}
