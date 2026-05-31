import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, tap, catchError, throwError, of, map, switchMap } from 'rxjs';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { IOrder } from 'app/entities/order/order.model';
import { IOrderItem } from 'app/entities/order-item/order-item.model';
import { CheckoutState, CheckoutStep, OrderItemDisplay, PaymentMethod } from '../order-checkout.model';
import { OrderStatus } from '../../enumerations/order-status.model';
import { PaymentStatus } from '../../enumerations/payment-status.model';
import { ToastService } from '../../../shared/notification/toast.service';
import { IProduct } from '../../product/product.model';

const STORAGE_KEY = 'samabutik_order_checkout';

@Injectable({ providedIn: 'root' })
export class OrderCheckoutService {
  private readonly orderResource: string;
  private readonly http = inject(HttpClient);
  private readonly configService = inject(ApplicationConfigService);
  private readonly toastService = inject(ToastService);

  readonly state = signal<CheckoutState | null>(null);
  readonly currentStep = computed(() => this.state()?.currentStep ?? CheckoutStep.SUMMARY);
  readonly order = computed(() => this.state()?.order);
  readonly items = computed(() => this.state()?.items ?? []);
  readonly total = computed(() => this.state()?.order?.totalAmount ?? 0);
  readonly isLoading = computed(() => this.state()?.isLoading ?? false);
  readonly canProceed = computed(() => this.validateCurrentStep());

  constructor() {
    this.orderResource = this.configService.getEndpointFor('api/orders');
    this.loadFromStorage();
  }

  initializeCheckout(orderId?: number): void {
    this.setState({ isLoading: true });

    if (orderId) {
      this.loadOrder(orderId);
    } else {
      this.http.get<IOrder | null>(`${this.orderResource}/cart/active`).subscribe({
        next: order => {
          if (order) {
            this.handleOrderLoaded(order);
          } else {
            this.createPendingOrder().subscribe();
          }
        },
        error: () => this.createPendingOrder().subscribe(),
      });
    }
  }

  loadOrder(orderId: number): void {
    this.setState({ isLoading: true });
    this.http.get<IOrder>(`${this.orderResource}/${orderId}`).subscribe({
      next: order => this.handleOrderLoaded(order),
      error: () => this.handleError('Impossible de charger la commande'),
    });
  }

  private createPendingOrder(): Observable<IOrder> {
    const newOrder: Partial<IOrder> = {
      orderNumber: `ORD-${this.generateOrderNumber()}`,
      status: OrderStatus.PENDING,
      totalAmount: 0,
      currency: 'XOF',
      shippingCost: 1500,
      shippingAddress: '',
      paymentStatus: PaymentStatus.PENDING,
    };

    return this.http.post<IOrder>(this.orderResource, newOrder);
  }
  generateOrderNumber() {
    const now = new Date();

    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    const ms = String(now.getMilliseconds()).padStart(3, '0');
    return `-${yy}${mm}${dd}-${hh}${min}-${ms}`;
  }

  private handleOrderLoaded(order: IOrder): void {
    this.http.get<IOrderItem[]>(`${this.orderResource}/${order.id}/items`).subscribe({
      next: items => {
        const orderItems: OrderItemDisplay[] = items.map(item => ({
          id: item.id!,
          productName: item.productName!,
          productSku: item.productSku!,
          quantity: item.quantity!,
          unitPrice: item.unitPrice!,
          subtotal: item.subtotal!,
          isPackItem: item.isPackItem ?? false,
          stockAvailable: (item.productSnapshot as any)?.stock ?? 99,
          productImage: (item.productSnapshot as any)?.mainMedia?.url,
        }));

        const subtotal = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
        const shippingCost = order.shippingCost ?? 1500;

        const checkoutState: CheckoutState = {
          order: {
            id: order.id,
            orderNumber: order.orderNumber ?? undefined,
            status: order.status as OrderStatus,
            totalAmount: order.totalAmount ?? subtotal + shippingCost,
            currency: order.currency ?? 'XOF',
            shippingAddress: order.shippingAddress ?? '',
            shippingCost: shippingCost,
            deliveryNote: order.deliveryNote ?? undefined,
            paymentMethod: order.paymentMethod as PaymentMethod | undefined,
            paymentStatus: order.paymentStatus as PaymentStatus | undefined,
            phoneNumber: (order as any).phoneNumber ?? '',
          },
          items: orderItems,
          currentStep: CheckoutStep.SUMMARY,
          isLoading: false,
        };

        this.state.set(checkoutState);
        this.saveToStorage();
      },
      error: () => this.handleError('Erreur lors du chargement des articles'),
    });
  }

  private refreshOrder(orderId: number): void {
    this.http.get<IOrder>(`${this.orderResource}/${orderId}`).subscribe({
      next: order => {
        const state = this.state();
        if (state) {
          this.state.set({
            ...state,
            order: {
              id: order.id,
              orderNumber: order.orderNumber ?? undefined,
              status: order.status as OrderStatus,
              totalAmount: order.totalAmount ?? state.order.totalAmount,
              currency: order.currency ?? 'XOF',
              shippingAddress: order.shippingAddress ?? '',
              shippingCost: order.shippingCost ?? 1500,
              deliveryNote: order.deliveryNote ?? undefined,
              paymentMethod: order.paymentMethod as PaymentMethod | undefined,
              paymentStatus: order.paymentStatus as PaymentStatus | undefined,
              phoneNumber: (order as any).phoneNumber ?? '',
            },
          });
          this.saveToStorage();
        }
      },
      error: () => this.handleError('Erreur lors du rafraîchissement'),
    });
  }

  nextStep(): boolean {
    const state = this.state();
    if (!state || !this.canProceed()) return false;

    if (state.currentStep < CheckoutStep.VALIDATION) {
      const nextState: CheckoutState = {
        ...state,
        currentStep: (state.currentStep + 1) as CheckoutStep,
      };
      this.state.set(nextState);
      this.saveToStorage();

      if (nextState.currentStep === CheckoutStep.VALIDATION) {
        this.processPayment();
      }
      return true;
    }
    return false;
  }

  previousStep(): void {
    const state = this.state();
    if (!state || state.currentStep <= CheckoutStep.SUMMARY) return;

    this.state.set({
      ...state,
      currentStep: (state.currentStep - 1) as CheckoutStep,
    });
    this.saveToStorage();
  }

  goToStep(step: CheckoutStep): void {
    const state = this.state();
    if (!state || step > state.currentStep) return;
    this.state.set({ ...state, currentStep: step });
    this.saveToStorage();
  }

  private validateCurrentStep(): boolean {
    const state = this.state();
    if (!state) return false;

    switch (state.currentStep) {
      case CheckoutStep.SUMMARY:
        return state.items.length > 0;
      case CheckoutStep.SHIPPING:
        return state.order.shippingAddress.trim().length >= 5;
      case CheckoutStep.PAYMENT:
        return !!(state.order.paymentMethod && (state.order.phoneNumber?.replace(/\s/g, '').length ?? 0) >= 9);
      default:
        return true;
    }
  }

  updateShippingAddress(address: string, note?: string): void {
    const state = this.state();
    if (!state?.order?.id) return;

    this.state.set({
      ...state,
      order: { ...state.order, shippingAddress: address, deliveryNote: note },
    });
    this.saveToStorage();
  }

  updatePaymentMethod(method: PaymentMethod, phoneNumber: string): void {
    const state = this.state();
    if (!state?.order?.id) return;

    this.state.set({
      ...state,
      order: {
        ...state.order,
        paymentMethod: method,
        phoneNumber: phoneNumber,
        paymentStatus: PaymentStatus.PENDING,
      },
    });
    this.saveToStorage();
  }

  updateOrderItemQuantity(itemId: number, quantity: number): void {
    const state = this.state();
    if (!state) return;

    const updatedItems = state.items.map(item => (item.id === itemId ? { ...item, quantity, subtotal: item.unitPrice * quantity } : item));

    const subtotal = updatedItems.reduce((sum, item) => sum + item.subtotal, 0);
    const totalAmount = subtotal + (state.order.shippingCost ?? 1500);

    this.state.set({
      ...state,
      items: updatedItems,
      order: { ...state.order, totalAmount },
    });
    this.saveToStorage();
  }

  removeOrderItem(itemId: number): void {
    const state = this.state();
    if (!state) return;

    const updatedItems = state.items.filter(item => item.id !== itemId);
    const subtotal = updatedItems.reduce((sum, item) => sum + item.subtotal, 0);
    const totalAmount = subtotal + (state.order.shippingCost ?? 1500);

    this.state.set({
      ...state,
      items: updatedItems,
      order: { ...state.order, totalAmount },
    });
    this.saveToStorage();
  }

  processPayment(): void {
    const state = this.state();
    if (!state?.order?.id || !state.order.paymentMethod) return;

    this.setState({ isLoading: true });
  }

  confirmOrder(): Observable<HttpResponse<IOrder>> {
    const state = this.state();
    if (!state?.order?.id) {
      return throwError(() => new Error('Commande invalide'));
    }

    const updatedOrder = {
      ...state.order,
      status: OrderStatus.PAID,
      paymentStatus: PaymentStatus.SUCCESS,
      paymentReference: `PAY-${Date.now()}`,
    };

    return this.http.patch<IOrder>(`${this.orderResource}/${state.order.id}`, updatedOrder, { observe: 'response' }).pipe(
      tap(() => this.clearStorage()),
      catchError(err => {
        this.handleError('Erreur lors de la confirmation');
        return throwError(() => err);
      }),
    );
  }

  getOrderTracking(orderId: number): Observable<any> {
    return this.http.get<any>(`${this.orderResource}/${orderId}/tracking`).pipe(
      catchError(() =>
        of({
          status: OrderStatus.PREPARING,
          timeline: [],
          estimatedDelivery: 'Demain',
        }),
      ),
    );
  }

  addProductToCart(product: IProduct): Observable<IOrder> {
    const state = this.state();
    const orderId = state?.order?.id;

    const newItem: Partial<IOrderItem> = {
      productName: product.name,
      productSku: product.sku,
      quantity: 1,
      unitPrice: product.price,
      subtotal: product.price,
      isPackItem: false,
      productSnapshot: product,
    };

    if (orderId) {
      return this.http.post<IOrderItem>(`${this.orderResource}/${orderId}/items`, newItem).pipe(
        switchMap(() => this.http.get<IOrder>(`${this.orderResource}/${orderId}`)),
        tap(updatedOrder => {
          const currentState = this.state();
          if (currentState) {
            this.state.set({
              ...currentState,
              order: {
                ...currentState.order,
                id: updatedOrder.id,
                orderNumber: updatedOrder.orderNumber ?? undefined,
                status: updatedOrder.status as OrderStatus,
                totalAmount: updatedOrder.totalAmount ?? currentState.order.totalAmount,
                currency: updatedOrder.currency ?? 'XOF',
                shippingAddress: updatedOrder.shippingAddress ?? '',
                shippingCost: updatedOrder.shippingCost ?? 1500,
                deliveryNote: updatedOrder.deliveryNote ?? undefined,
                paymentMethod: updatedOrder.paymentMethod as PaymentMethod | undefined,
                paymentStatus: updatedOrder.paymentStatus as PaymentStatus | undefined,
                phoneNumber: (updatedOrder as any).phoneNumber ?? '',
              },
            });
            this.saveToStorage();
          }
          this.refreshOrderItems(updatedOrder.id);
        }),
        map(() => this.order() as IOrder),
      );
    } else {
      return this.createPendingOrder().pipe(
        switchMap(order =>
          this.http.post<IOrderItem>(`${this.orderResource}/${order.id}/items`, newItem).pipe(
            switchMap(() => this.http.get<IOrder>(`${this.orderResource}/${order.id}`)),
            tap(updatedOrder => {
              const currentState = this.state();
              if (currentState) {
                this.state.set({
                  ...currentState,
                  order: {
                    ...currentState.order,
                    id: updatedOrder.id,
                    orderNumber: updatedOrder.orderNumber ?? undefined,
                    status: updatedOrder.status as OrderStatus,
                    totalAmount: updatedOrder.totalAmount ?? currentState.order.totalAmount,
                    currency: updatedOrder.currency ?? 'XOF',
                    shippingAddress: updatedOrder.shippingAddress ?? '',
                    shippingCost: updatedOrder.shippingCost ?? 1500,
                    deliveryNote: updatedOrder.deliveryNote ?? undefined,
                    paymentMethod: updatedOrder.paymentMethod as PaymentMethod | undefined,
                    paymentStatus: updatedOrder.paymentStatus as PaymentStatus | undefined,
                    phoneNumber: (updatedOrder as any).phoneNumber ?? '',
                  },
                });
                this.saveToStorage();
              }
              this.refreshOrderItems(updatedOrder.id);
            }),
            map(() => this.order() as IOrder),
          ),
        ),
      );
    }
  }

  private refreshOrderItems(orderId: number): void {
    this.http.get<IOrderItem[]>(`${this.orderResource}/${orderId}/items`).subscribe({
      next: items => {
        const orderItems: OrderItemDisplay[] = items.map(item => ({
          id: item.id!,
          productName: item.productName!,
          productSku: item.productSku!,
          quantity: item.quantity!,
          unitPrice: item.unitPrice!,
          subtotal: item.subtotal!,
          isPackItem: item.isPackItem ?? false,
          stockAvailable: (item.productSnapshot as any)?.stock ?? 99,
          productImage: (item.productSnapshot as any)?.mainMedia?.url,
        }));

        const state = this.state();
        if (state) {
          this.state.set({
            ...state,
            items: orderItems,
          });
          this.saveToStorage();
        }
      },
      error: () => this.handleError('Erreur lors du chargement des articles'),
    });
  }

  private saveToStorage(): void {
    const state = this.state();
    if (state && !state.isLoading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.order?.status === OrderStatus.PENDING) {
          this.state.set(parsed);
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  clearStorage(): void {
    localStorage.removeItem(STORAGE_KEY);
    this.state.set(null);
  }

  private setState(partial: Partial<CheckoutState>): void {
    const current = this.state();
    if (current) {
      this.state.set({ ...current, ...partial });
    }
  }

  private handleError(message: string): void {
    const state = this.state();
    if (state) {
      this.state.set({ ...state, isLoading: false, error: message });
    }
    this.toastService?.error(message);
    console.error('[Checkout]', message);
  }

  formatPrice(amount: number): string {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  }

  formatPhone(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 9) {
      return cleaned.replace(/(\d{2})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4');
    }
    return phone;
  }
}
