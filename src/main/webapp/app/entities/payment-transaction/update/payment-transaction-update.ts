import { HttpResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import { PaymentProvider } from 'app/entities/enumerations/payment-provider.model';
import { TransactionStatus } from 'app/entities/enumerations/transaction-status.model';
import { IOrder } from 'app/entities/order/order.model';
import { OrderService } from 'app/entities/order/service/order.service';
import { AlertError } from 'app/shared/alert/alert-error';
import { TranslateDirective } from 'app/shared/language';
import { IPaymentTransaction } from '../payment-transaction.model';
import { PaymentTransactionService } from '../service/payment-transaction.service';

import { PaymentTransactionFormGroup, PaymentTransactionFormService } from './payment-transaction-form.service';

@Component({
  selector: 'jhi-payment-transaction-update',
  templateUrl: './payment-transaction-update.html',
  imports: [TranslateDirective, TranslateModule, FontAwesomeModule, AlertError, ReactiveFormsModule],
})
export class PaymentTransactionUpdate implements OnInit {
  readonly isSaving = signal(false);
  paymentTransaction: IPaymentTransaction | null = null;
  paymentProviderValues = Object.keys(PaymentProvider);
  transactionStatusValues = Object.keys(TransactionStatus);

  ordersSharedCollection = signal<IOrder[]>([]);

  protected paymentTransactionService = inject(PaymentTransactionService);
  protected paymentTransactionFormService = inject(PaymentTransactionFormService);
  protected orderService = inject(OrderService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: PaymentTransactionFormGroup = this.paymentTransactionFormService.createPaymentTransactionFormGroup();

  compareOrder = (o1: IOrder | null, o2: IOrder | null): boolean => this.orderService.compareOrder(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ paymentTransaction }) => {
      this.paymentTransaction = paymentTransaction;
      if (paymentTransaction) {
        this.updateForm(paymentTransaction);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    globalThis.history.back();
  }

  save(): void {
    this.isSaving.set(true);
    const paymentTransaction = this.paymentTransactionFormService.getPaymentTransaction(this.editForm);
    if (paymentTransaction.id === null) {
      this.subscribeToSaveResponse(this.paymentTransactionService.create(paymentTransaction));
    } else {
      this.subscribeToSaveResponse(this.paymentTransactionService.update(paymentTransaction));
    }
  }

  protected subscribeToSaveResponse(result: Observable<IPaymentTransaction | null>): void {
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

  protected updateForm(paymentTransaction: IPaymentTransaction): void {
    this.paymentTransaction = paymentTransaction;
    this.paymentTransactionFormService.resetForm(this.editForm, paymentTransaction);

    this.ordersSharedCollection.update(orders => this.orderService.addOrderToCollectionIfMissing<IOrder>(orders, paymentTransaction.order));
  }

  protected loadRelationshipsOptions(): void {
    this.orderService
      .query()
      .pipe(map((res: HttpResponse<IOrder[]>) => res.body ?? []))
      .pipe(map((orders: IOrder[]) => this.orderService.addOrderToCollectionIfMissing<IOrder>(orders, this.paymentTransaction?.order)))
      .subscribe((orders: IOrder[]) => this.ordersSharedCollection.set(orders));
  }
}
