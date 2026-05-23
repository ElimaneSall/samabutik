import { HttpResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import { ICustomer } from 'app/entities/customer/customer.model';
import { CustomerService } from 'app/entities/customer/service/customer.service';
import { OrderStatus } from 'app/entities/enumerations/order-status.model';
import { PaymentMethod } from 'app/entities/enumerations/payment-method.model';
import { PaymentStatus } from 'app/entities/enumerations/payment-status.model';
import { AlertError } from 'app/shared/alert/alert-error';
import { TranslateDirective } from 'app/shared/language';
import { IOrder } from '../order.model';
import { OrderService } from '../service/order.service';

import { OrderFormGroup, OrderFormService } from './order-form.service';

@Component({
  selector: 'jhi-order-update',
  templateUrl: './order-update.html',
  imports: [TranslateDirective, TranslateModule, FontAwesomeModule, AlertError, ReactiveFormsModule],
})
export class OrderUpdate implements OnInit {
  readonly isSaving = signal(false);
  order: IOrder | null = null;
  orderStatusValues = Object.keys(OrderStatus);
  paymentMethodValues = Object.keys(PaymentMethod);
  paymentStatusValues = Object.keys(PaymentStatus);

  customersSharedCollection = signal<ICustomer[]>([]);

  protected orderService = inject(OrderService);
  protected orderFormService = inject(OrderFormService);
  protected customerService = inject(CustomerService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: OrderFormGroup = this.orderFormService.createOrderFormGroup();

  compareCustomer = (o1: ICustomer | null, o2: ICustomer | null): boolean => this.customerService.compareCustomer(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ order }) => {
      this.order = order;
      if (order) {
        this.updateForm(order);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    globalThis.history.back();
  }

  save(): void {
    this.isSaving.set(true);
    const order = this.orderFormService.getOrder(this.editForm);
    if (order.id === null) {
      this.subscribeToSaveResponse(this.orderService.create(order));
    } else {
      this.subscribeToSaveResponse(this.orderService.update(order));
    }
  }

  protected subscribeToSaveResponse(result: Observable<IOrder | null>): void {
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

  protected updateForm(order: IOrder): void {
    this.order = order;
    this.orderFormService.resetForm(this.editForm, order);

    this.customersSharedCollection.update(customers =>
      this.customerService.addCustomerToCollectionIfMissing<ICustomer>(customers, order.customer),
    );
  }

  protected loadRelationshipsOptions(): void {
    this.customerService
      .query()
      .pipe(map((res: HttpResponse<ICustomer[]>) => res.body ?? []))
      .pipe(
        map((customers: ICustomer[]) => this.customerService.addCustomerToCollectionIfMissing<ICustomer>(customers, this.order?.customer)),
      )
      .subscribe((customers: ICustomer[]) => this.customersSharedCollection.set(customers));
  }
}
