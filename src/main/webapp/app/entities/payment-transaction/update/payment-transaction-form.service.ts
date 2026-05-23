import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';

import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IPaymentTransaction, NewPaymentTransaction } from '../payment-transaction.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IPaymentTransaction for edit and NewPaymentTransactionFormGroupInput for create.
 */
type PaymentTransactionFormGroupInput = IPaymentTransaction | PartialWithRequiredKeyOf<NewPaymentTransaction>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IPaymentTransaction | NewPaymentTransaction> = Omit<T, 'processedAt'> & {
  processedAt?: string | null;
};

type PaymentTransactionFormRawValue = FormValueOf<IPaymentTransaction>;

type NewPaymentTransactionFormRawValue = FormValueOf<NewPaymentTransaction>;

type PaymentTransactionFormDefaults = Pick<NewPaymentTransaction, 'id' | 'processedAt'>;

type PaymentTransactionFormGroupContent = {
  id: FormControl<PaymentTransactionFormRawValue['id'] | NewPaymentTransaction['id']>;
  provider: FormControl<PaymentTransactionFormRawValue['provider']>;
  transactionId: FormControl<PaymentTransactionFormRawValue['transactionId']>;
  amount: FormControl<PaymentTransactionFormRawValue['amount']>;
  currency: FormControl<PaymentTransactionFormRawValue['currency']>;
  status: FormControl<PaymentTransactionFormRawValue['status']>;
  webhookPayload: FormControl<PaymentTransactionFormRawValue['webhookPayload']>;
  processedAt: FormControl<PaymentTransactionFormRawValue['processedAt']>;
  order: FormControl<PaymentTransactionFormRawValue['order']>;
};

export type PaymentTransactionFormGroup = FormGroup<PaymentTransactionFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class PaymentTransactionFormService {
  createPaymentTransactionFormGroup(paymentTransaction?: PaymentTransactionFormGroupInput): PaymentTransactionFormGroup {
    const paymentTransactionRawValue = this.convertPaymentTransactionToPaymentTransactionRawValue({
      ...this.getFormDefaults(),
      ...(paymentTransaction ?? { id: null }),
    });
    return new FormGroup<PaymentTransactionFormGroupContent>({
      id: new FormControl(
        { value: paymentTransactionRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      provider: new FormControl(paymentTransactionRawValue.provider, {
        validators: [Validators.required],
      }),
      transactionId: new FormControl(paymentTransactionRawValue.transactionId, {
        validators: [Validators.required, Validators.maxLength(100)],
      }),
      amount: new FormControl(paymentTransactionRawValue.amount, {
        validators: [Validators.required, Validators.min(0)],
      }),
      currency: new FormControl(paymentTransactionRawValue.currency, {
        validators: [Validators.required, Validators.maxLength(3)],
      }),
      status: new FormControl(paymentTransactionRawValue.status, {
        validators: [Validators.required],
      }),
      webhookPayload: new FormControl(paymentTransactionRawValue.webhookPayload, {
        validators: [Validators.maxLength(10000)],
      }),
      processedAt: new FormControl(paymentTransactionRawValue.processedAt),
      order: new FormControl(paymentTransactionRawValue.order),
    });
  }

  getPaymentTransaction(form: PaymentTransactionFormGroup): IPaymentTransaction | NewPaymentTransaction {
    return this.convertPaymentTransactionRawValueToPaymentTransaction(
      form.getRawValue() as PaymentTransactionFormRawValue | NewPaymentTransactionFormRawValue,
    );
  }

  resetForm(form: PaymentTransactionFormGroup, paymentTransaction: PaymentTransactionFormGroupInput): void {
    const paymentTransactionRawValue = this.convertPaymentTransactionToPaymentTransactionRawValue({
      ...this.getFormDefaults(),
      ...paymentTransaction,
    });
    form.reset({
      ...paymentTransactionRawValue,
      id: { value: paymentTransactionRawValue.id, disabled: true },
    });
  }

  private getFormDefaults(): PaymentTransactionFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      processedAt: currentTime,
    };
  }

  private convertPaymentTransactionRawValueToPaymentTransaction(
    rawPaymentTransaction: PaymentTransactionFormRawValue | NewPaymentTransactionFormRawValue,
  ): IPaymentTransaction | NewPaymentTransaction {
    return {
      ...rawPaymentTransaction,
      processedAt: dayjs(rawPaymentTransaction.processedAt, DATE_TIME_FORMAT),
    };
  }

  private convertPaymentTransactionToPaymentTransactionRawValue(
    paymentTransaction: IPaymentTransaction | (Partial<NewPaymentTransaction> & PaymentTransactionFormDefaults),
  ): PaymentTransactionFormRawValue | PartialWithRequiredKeyOf<NewPaymentTransactionFormRawValue> {
    return {
      ...paymentTransaction,
      processedAt: paymentTransaction.processedAt ? paymentTransaction.processedAt.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
