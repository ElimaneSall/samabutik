// home.ts - Version corrigée avec notifications
import { Component, OnInit, inject, signal, computed, effect, afterNextRender } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule, DecimalPipe } from '@angular/common';
import dayjs from 'dayjs/esm';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslateModule } from '@ngx-translate/core';
import { HttpResponse, HttpHeaders } from '@angular/common/http';
import { ToastService } from 'app/shared/notification/toast.service';
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
import { ToastComponent } from '../shared/notification/toast.component/toast.component';

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
  imports: [CommonModule, DecimalPipe, FontAwesomeModule, TranslateModule, PackCarousel, ToastComponent],
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
  private readonly orderService = inject(OrderService);
  private readonly orderItemService = inject(OrderItemService);
  private readonly toastService = inject(ToastService); // ✅ Injection du ToastService

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
        error: () => {
          this.bestSellers.set([]);
          this.toastService.error('Erreur lors du chargement des meilleures ventes');
        },
      });

    // Featured packs
    this.packService
      .query({
        displayOnHomepage: true,
        isActive: true,
        sort: ['id,desc'],
        size: 5,
      })
      .subscribe({
        next: (res: HttpResponse<IPack[]>) => {
          const now = dayjs();
          const activePacks = (res.body ?? []).filter(
            pack => pack.isActive && pack.displayOnHomepage && (!pack.endDate || dayjs(pack.endDate).isAfter(now)),
          );
          this.featuredPacks.set(activePacks.slice(0, 5));
        },
        error: () => {
          this.featuredPacks.set([]);
          this.toastService.error('Erreur lors du chargement des packs');
        },
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
          this.toastService.error('Erreur lors du chargement des nouveautés');
        },
      });
  }
  // home.ts - refreshCartState corrigé
  refreshCartState(): void {
    console.log('🔄 Refreshing cart state...');

    // Récupérer la commande PENDING la PLUS RÉCENTE
    this.orderService
      .query({
        status: OrderStatus.PENDING,
        sort: ['id,desc'], // Tri par ID descendant pour avoir le plus récent en premier
        size: 1,
      })
      .subscribe({
        next: (res: HttpResponse<IOrder[]>) => {
          const orders = res.body ?? [];
          // Prendre la première commande (la plus récente)
          const cartOrder = orders.length > 0 ? orders[0] : null;

          console.log('📦 Active cart order:', cartOrder);
          this.currentCartOrder.set(cartOrder);

          if (cartOrder?.id) {
            // Récupérer les items de CETTE commande uniquement
            this.orderItemService
              .query({
                'orderId.equals': cartOrder.id,
              })
              .subscribe({
                next: (itemRes: HttpResponse<IOrderItem[]>) => {
                  const items = itemRes.body ?? [];
                  console.log(`📋 ${items.length} items in order ${cartOrder.id}:`, items);
                  this.cartItems.set(items);
                },
                error: err => {
                  console.error('❌ Error loading items:', err);
                  this.cartItems.set([]);
                },
              });
          } else {
            console.log('🛒 No PENDING order found');
            this.cartItems.set([]);
          }
        },
        error: err => {
          console.error('❌ Error loading orders:', err);
          this.currentCartOrder.set(null);
          this.cartItems.set([]);
        },
      });
  }

  // Générer un numéro de commande unique
  private generateOrderNumber(): string {
    const date = new Date();
    const yy = String(date.getFullYear()).slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    // Keeping a 3-digit random number
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0');

    return `ORD-${yy}${month}${day}-${hours}${minutes}-${random}`;
  }
  addToCart(product: IProduct, event?: Event): void {
    event?.stopPropagation();

    if (!product.stock || product.stock <= 0) {
      this.toastService.warning(`⚠️ ${product.name} n'est plus en stock`);
      return;
    }

    const addOrUpdateItem = (cartOrder: IOrder) => {
      // RECHERCHE PAR productSnapshot.id au lieu de productSku
      const existingItem = this.cartItems().find(item => item.productSnapshot?.id === product.id && !item.isPackItem);

      if (existingItem?.id) {
        const newQuantity = (existingItem.quantity ?? 0) + 1;

        if (newQuantity > (product.stock ?? 0)) {
          this.toastService.warning(`Stock limité: seulement ${product.stock} disponible(s)`);
          return;
        }

        // Mise à jour de l'item existant
        this.orderItemService
          .update({
            ...existingItem,
            quantity: newQuantity,
            subtotal: (existingItem.unitPrice ?? 0) * newQuantity,
          })
          .subscribe({
            next: () => {
              this.refreshCartState();
              this.toastService.success(`✓ ${product.name} ajouté au panier (${newQuantity})`);
            },
            error: err => {
              console.error('Erreur mise à jour panier:', err);
              this.toastService.error(`Erreur: Impossible d'ajouter ${product.name}`);
            },
          });
      } else {
        // Création d'un nouvel item
        const newItem: NewOrderItem = {
          id: null,
          productName: product.name,
          productSku: product.sku,
          quantity: 1,
          unitPrice: product.price ?? 0,
          subtotal: product.price ?? 0,
          isPackItem: false,
          productSnapshot: product,
          order: cartOrder,
        };

        this.orderItemService.create(newItem).subscribe({
          next: () => {
            this.refreshCartState();
            this.toastService.success(`✓ ${product.name} ajouté au panier`);
          },
          error: err => {
            console.error('Erreur ajout au panier:', err);
            this.toastService.error(`Erreur: Impossible d'ajouter ${product.name}`);
          },
        });
      }
    };

    const cartOrder = this.currentCartOrder();
    if (cartOrder?.id) {
      addOrUpdateItem(cartOrder);
    } else {
      const orderNumber = this.generateOrderNumber();

      const newCart: NewOrder = {
        id: null,
        orderNumber: orderNumber,
        status: OrderStatus.PENDING,
        totalAmount: 0,
        currency: 'XOF',
        paymentMethod: null,
        paymentStatus: null,
        paymentReference: null,
        shippingAddress: '',
        shippingCost: 0,
        deliveryNote: null,
        deliveredAt: null,
        customer: null,
      };

      this.orderService.create(newCart).subscribe({
        next: createdOrder => {
          this.currentCartOrder.set(createdOrder);
          addOrUpdateItem(createdOrder);
        },
        error: err => {
          console.error('Erreur création panier:', err);
          this.toastService.error('Erreur lors de la création du panier');
        },
      });
    }
  }
  // 🔹 Ajouter un pack au panier
  addPackToCart(pack: IPack, event?: Event): void {
    event?.stopPropagation();

    if (!this.isPackAvailable(pack)) {
      this.toastService.warning(`⚠️ Le pack "${pack.name}" n'est pas disponible`);
      return;
    }

    const addOrUpdatePackItems = (cartOrder: IOrder) => {
      let itemsAdded = 0;
      let itemsFailed = 0;

      pack.packItems?.forEach(packItem => {
        const product = packItem.product;
        if (!product || !product.stock || product.stock <= 0) {
          itemsFailed++;
          return;
        }

        const quantity = packItem.quantity ?? 1;

        if (quantity > (product.stock ?? 0)) {
          itemsFailed++;
          this.toastService.warning(`${product.name}: stock insuffisant`);
          return;
        }

        const existingItem = this.cartItems().find(item => item.productSku === product.sku && !item.isPackItem);

        if (existingItem?.id) {
          const newQuantity = (existingItem.quantity ?? 0) + quantity;
          if (newQuantity <= (product.stock ?? 0)) {
            this.orderItemService
              .update({
                ...existingItem,
                quantity: newQuantity,
                subtotal: (existingItem.unitPrice ?? 0) * newQuantity,
              })
              .subscribe({
                next: () => {
                  itemsAdded++;
                  if (itemsAdded + itemsFailed === (pack.packItems?.length ?? 0)) {
                    this.refreshCartState();
                    this.toastService.success(`✓ Pack "${pack.name}" ajouté au panier`);
                  }
                },
                error: () => {
                  itemsFailed++;
                  this.toastService.error(`Erreur lors de l'ajout de ${product.name}`);
                },
              });
          } else {
            itemsFailed++;
            this.toastService.warning(`${product.name}: stock dépassé`);
          }
        } else {
          const newItem: NewOrderItem = {
            id: null,
            productName: product.name,
            productSku: product.sku,
            quantity: quantity,
            unitPrice: product.price ?? 0,
            subtotal: (product.price ?? 0) * quantity,
            isPackItem: true,
            productSnapshot: product,
            order: cartOrder,
          };

          this.orderItemService.create(newItem).subscribe({
            next: () => {
              itemsAdded++;
              if (itemsAdded + itemsFailed === (pack.packItems?.length ?? 0)) {
                this.refreshCartState();
                this.toastService.success(`✓ Pack "${pack.name}" ajouté au panier`);
              }
            },
            error: () => {
              itemsFailed++;
              this.toastService.error(`Erreur lors de l'ajout de ${product.name}`);
            },
          });
        }
      });
    };

    const cartOrder = this.currentCartOrder();
    if (cartOrder?.id) {
      addOrUpdatePackItems(cartOrder);
    } else {
      const orderNumber = this.generateOrderNumber();

      const newCart: NewOrder = {
        id: null,
        orderNumber: orderNumber, // ✅ Ajouté
        status: OrderStatus.PENDING,
        totalAmount: 0,
        currency: 'XOF',
        paymentMethod: null,
        paymentStatus: null,
        paymentReference: null,
        shippingAddress: '', // ✅ Ajouté
        shippingCost: 0,
        deliveryNote: null,
        deliveredAt: null,
        customer: null,
      };

      this.orderService.create(newCart).subscribe({
        next: createdOrder => {
          this.currentCartOrder.set(createdOrder);
          addOrUpdatePackItems(createdOrder);
        },
        error: err => {
          console.error('❌ Erreur création panier:', err);
          this.toastService.error('Erreur lors de la création du panier');
        },
      });
    }
  }

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

  setCategoriesFromProducts(productsBody: any[] | null | undefined): void {
    if (!productsBody) {
      this.categoriesList.set([]);
      return;
    }

    const uniqueNames = [...new Set(productsBody.map(p => p.category).filter(Boolean) as string[])];

    const mappedCategories: Category[] = uniqueNames.map((name, index) => {
      return {
        id: `cat-${index + 1}-${Math.random().toString(36).substring(2, 5)}`,
        name: name,
        count: productsBody.filter(p => p.category === name).length,
      };
    });

    this.categoriesList.set(mappedCategories);
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
