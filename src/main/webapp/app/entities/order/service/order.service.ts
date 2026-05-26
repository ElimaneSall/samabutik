import { HttpClient, HttpResponse, httpResource } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';

import dayjs from 'dayjs/esm';
import { Observable, map, switchMap } from 'rxjs';

import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { isPresent } from 'app/core/util/operators';
import { IOrder, NewOrder } from '../order.model';
import { OrderStatus } from '../../enumerations/order-status.model';
import { PaymentStatus } from '../../enumerations/payment-status.model';
import { PaymentMethod } from '../../enumerations/payment-method.model';
import { IOrderItem } from '../../order-item/order-item.model';

export type PartialUpdateOrder = Partial<IOrder> & Pick<IOrder, 'id'>;

type RestOf<T extends IOrder | NewOrder> = Omit<T, 'deliveredAt'> & {
  deliveredAt?: string | null;
};

export type RestOrder = RestOf<IOrder>;

export type NewRestOrder = RestOf<NewOrder>;

export type PartialUpdateRestOrder = RestOf<PartialUpdateOrder>;

@Injectable()
export class OrdersService {
  readonly ordersParams = signal<Record<string, string | number | boolean | readonly (string | number | boolean)[]> | undefined>(undefined);
  readonly ordersResource = httpResource<RestOrder[]>(() => {
    const params = this.ordersParams();
    if (!params) {
      return undefined;
    }
    return { url: this.resourceUrl, params };
  });
  /**
   * This signal holds the list of order that have been fetched. It is updated when the ordersResource emits a new value.
   * In case of error while fetching the orders, the signal is set to an empty array.
   */
  readonly orders = computed(() =>
    (this.ordersResource.hasValue() ? this.ordersResource.value() : []).map(item => this.convertValueFromServer(item)),
  );
  protected readonly applicationConfigService = inject(ApplicationConfigService);
  protected readonly resourceUrl = this.applicationConfigService.getEndpointFor('api/orders');

  protected convertValueFromServer(restOrder: RestOrder): IOrder {
    return {
      ...restOrder,
      deliveredAt: restOrder.deliveredAt ? dayjs(restOrder.deliveredAt) : undefined,
    };
  }
}

@Injectable({ providedIn: 'root' })
export class OrderService extends OrdersService {
  protected readonly http = inject(HttpClient);

  create(order: NewOrder): Observable<IOrder> {
    const copy = this.convertValueFromClient(order);
    return this.http.post<RestOrder>(this.resourceUrl, copy).pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(order: IOrder): Observable<IOrder> {
    const copy = this.convertValueFromClient(order);
    return this.http
      .put<RestOrder>(`${this.resourceUrl}/${encodeURIComponent(this.getOrderIdentifier(order))}`, copy)
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(order: PartialUpdateOrder): Observable<IOrder> {
    const copy = this.convertValueFromClient(order);
    return this.http
      .patch<RestOrder>(`${this.resourceUrl}/${encodeURIComponent(this.getOrderIdentifier(order))}`, copy)
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<IOrder> {
    return this.http.get<RestOrder>(`${this.resourceUrl}/${encodeURIComponent(id)}`).pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<HttpResponse<IOrder[]>> {
    const options = createRequestOption(req);
    return this.http
      .get<RestOrder[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => res.clone({ body: this.convertResponseArrayFromServer(res.body!) })));
  }

  delete(id: number): Observable<undefined> {
    return this.http.delete<undefined>(`${this.resourceUrl}/${encodeURIComponent(id)}`);
  }

  getOrderIdentifier(order: Pick<IOrder, 'id'>): number {
    return order.id;
  }

  compareOrder(o1: Pick<IOrder, 'id'> | null, o2: Pick<IOrder, 'id'> | null): boolean {
    return o1 && o2 ? this.getOrderIdentifier(o1) === this.getOrderIdentifier(o2) : o1 === o2;
  }

  addOrderToCollectionIfMissing<Type extends Pick<IOrder, 'id'>>(
    orderCollection: Type[],
    ...ordersToCheck: (Type | null | undefined)[]
  ): Type[] {
    const orders: Type[] = ordersToCheck.filter(isPresent);
    if (orders.length > 0) {
      const orderCollectionIdentifiers = orderCollection.map(orderItem => this.getOrderIdentifier(orderItem));
      const ordersToAdd = orders.filter(orderItem => {
        const orderIdentifier = this.getOrderIdentifier(orderItem);
        if (orderCollectionIdentifiers.includes(orderIdentifier)) {
          return false;
        }
        orderCollectionIdentifiers.push(orderIdentifier);
        return true;
      });
      return [...ordersToAdd, ...orderCollection];
    }
    return orderCollection;
  }

  protected convertValueFromClient<T extends IOrder | NewOrder | PartialUpdateOrder>(order: T): RestOf<T> {
    return {
      ...order,
      deliveredAt: order.deliveredAt?.toJSON() ?? null,
    };
  }

  protected convertResponseFromServer(res: RestOrder): IOrder {
    return this.convertValueFromServer(res);
  }

  protected convertResponseArrayFromServer(res: RestOrder[]): IOrder[] {
    return res.map(item => this.convertValueFromServer(item));
  }

  exportCSV(): Observable<Blob> {
    const params = this.ordersParams();
    return this.http.get(`${this.resourceUrl}/export`, {
      params: params as any,
      responseType: 'blob',
    });
  }
  findWithItems(id: number): Observable<{ order: IOrder; items: IOrderItem[] }> {
    return this.find(id).pipe(
      switchMap(order => {
        return this.http.get<IOrderItem[]>(`${this.resourceUrl}/${id}/items`).pipe(map(items => ({ order, items })));
      }),
    );
  }

  // ✅ Ajouter cette méthode pour mettre à jour uniquement la livraison
  updateShippingInfo(id: number, shippingAddress: string, deliveryNote: string): Observable<IOrder> {
    return this.http
      .patch<RestOrder>(`${this.resourceUrl}/${id}/shipping`, {
        shippingAddress,
        deliveryNote,
      })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  // ✅ Ajouter cette méthode pour mettre à jour le paiement
  updatePaymentInfo(id: number, paymentMethod: PaymentMethod, phoneNumber: string): Observable<IOrder> {
    return this.http
      .patch<RestOrder>(`${this.resourceUrl}/${id}/payment`, {
        paymentMethod,
        paymentStatus: PaymentStatus.PENDING,
        phoneNumber,
      })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  // ✅ Ajouter cette méthode pour finaliser la commande
  finalizeOrder(id: number): Observable<IOrder> {
    return this.http
      .patch<RestOrder>(`${this.resourceUrl}/${id}/finalize`, {
        status: OrderStatus.PAID,
        paymentStatus: PaymentStatus.SUCCESS,
      })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  // ✅ Ajouter cette méthode pour récupérer le panier actif
  getActiveCart(): Observable<IOrder | null> {
    return this.http
      .get<RestOrder | null>(`${this.resourceUrl}/cart/active`)
      .pipe(map(res => (res ? this.convertResponseFromServer(res) : null)));
  }

  // ✅ Ajouter cette méthode pour obtenir les items d'une commande
  getOrderItems(orderId: number): Observable<IOrderItem[]> {
    return this.http.get<IOrderItem[]>(`${this.resourceUrl}/${orderId}/items`);
  }
}
