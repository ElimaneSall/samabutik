import { HttpResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import { IOrder } from 'app/entities/order/order.model';
import { OrderService } from 'app/entities/order/service/order.service';
import { IProduct } from 'app/entities/product/product.model';
import { ProductService } from 'app/entities/product/service/product.service';
import { AlertError } from 'app/shared/alert/alert-error';
import { TranslateDirective } from 'app/shared/language';
import { IOrderItem } from '../order-item.model';
import { OrderItemService } from '../service/order-item.service';

import { OrderItemFormGroup, OrderItemFormService } from './order-item-form.service';

@Component({
  selector: 'jhi-order-item-update',
  templateUrl: './order-item-update.html',
  imports: [TranslateDirective, TranslateModule, FontAwesomeModule, AlertError, ReactiveFormsModule],
})
export class OrderItemUpdate implements OnInit {
  readonly isSaving = signal(false);
  orderItem: IOrderItem | null = null;

  productSnapshotsCollection = signal<IProduct[]>([]);
  ordersSharedCollection = signal<IOrder[]>([]);

  protected orderItemService = inject(OrderItemService);
  protected orderItemFormService = inject(OrderItemFormService);
  protected productService = inject(ProductService);
  protected orderService = inject(OrderService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: OrderItemFormGroup = this.orderItemFormService.createOrderItemFormGroup();

  compareProduct = (o1: IProduct | null, o2: IProduct | null): boolean => this.productService.compareProduct(o1, o2);

  compareOrder = (o1: IOrder | null, o2: IOrder | null): boolean => this.orderService.compareOrder(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ orderItem }) => {
      this.orderItem = orderItem;
      if (orderItem) {
        this.updateForm(orderItem);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    globalThis.history.back();
  }

  save(): void {
    this.isSaving.set(true);
    const orderItem = this.orderItemFormService.getOrderItem(this.editForm);
    if (orderItem.id === null) {
      this.subscribeToSaveResponse(this.orderItemService.create(orderItem));
    } else {
      this.subscribeToSaveResponse(this.orderItemService.update(orderItem));
    }
  }

  protected subscribeToSaveResponse(result: Observable<IOrderItem | null>): void {
    result.pipe(finalize(() => this.onSaveFinalize())).subscribe({
      next: () => this.onSaveSuccess(),
      error: () => this.onSaveError(),
    });
  }

  protected onSaveSuccess(): void {
    this.previousState();
  }

  protected onSaveError(): void {
    // Api for inheritance.
  }

  protected onSaveFinalize(): void {
    this.isSaving.set(false);
  }

  protected updateForm(orderItem: IOrderItem): void {
    this.orderItem = orderItem;
    this.orderItemFormService.resetForm(this.editForm, orderItem);

    this.productSnapshotsCollection.set(
      this.productService.addProductToCollectionIfMissing<IProduct>(this.productSnapshotsCollection(), orderItem.productSnapshot),
    );
    this.ordersSharedCollection.update(orders => this.orderService.addOrderToCollectionIfMissing<IOrder>(orders, orderItem.order));
  }

  protected loadRelationshipsOptions(): void {
    this.productService
      .query({ filter: 'orderitem-is-null' })
      .pipe(map((res: HttpResponse<IProduct[]>) => res.body ?? []))
      .pipe(
        map((products: IProduct[]) =>
          this.productService.addProductToCollectionIfMissing<IProduct>(products, this.orderItem?.productSnapshot),
        ),
      )
      .subscribe((products: IProduct[]) => this.productSnapshotsCollection.set(products));

    this.orderService
      .query()
      .pipe(map((res: HttpResponse<IOrder[]>) => res.body ?? []))
      .pipe(map((orders: IOrder[]) => this.orderService.addOrderToCollectionIfMissing<IOrder>(orders, this.orderItem?.order)))
      .subscribe((orders: IOrder[]) => this.ordersSharedCollection.set(orders));
  }
}
