import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';

import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IOrder, NewOrder } from '../order.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IOrder for edit and NewOrderFormGroupInput for create.
 */
type OrderFormGroupInput = IOrder | PartialWithRequiredKeyOf<NewOrder>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IOrder | NewOrder> = Omit<T, 'deliveredAt'> & {
  deliveredAt?: string | null;
};

type OrderFormRawValue = FormValueOf<IOrder>;

type NewOrderFormRawValue = FormValueOf<NewOrder>;

type OrderFormDefaults = Pick<NewOrder, 'id' | 'deliveredAt'>;

type OrderFormGroupContent = {
  id: FormControl<OrderFormRawValue['id'] | NewOrder['id']>;
  orderNumber: FormControl<OrderFormRawValue['orderNumber']>;
  status: FormControl<OrderFormRawValue['status']>;
  totalAmount: FormControl<OrderFormRawValue['totalAmount']>;
  currency: FormControl<OrderFormRawValue['currency']>;
  paymentMethod: FormControl<OrderFormRawValue['paymentMethod']>;
  paymentStatus: FormControl<OrderFormRawValue['paymentStatus']>;
  paymentReference: FormControl<OrderFormRawValue['paymentReference']>;
  shippingAddress: FormControl<OrderFormRawValue['shippingAddress']>;
  shippingCost: FormControl<OrderFormRawValue['shippingCost']>;
  deliveryNote: FormControl<OrderFormRawValue['deliveryNote']>;
  deliveredAt: FormControl<OrderFormRawValue['deliveredAt']>;
  customer: FormControl<OrderFormRawValue['customer']>;
};

export type OrderFormGroup = FormGroup<OrderFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class OrderFormService {
  createOrderFormGroup(order?: OrderFormGroupInput): OrderFormGroup {
    const orderRawValue = this.convertOrderToOrderRawValue({
      ...this.getFormDefaults(),
      ...(order ?? { id: null }),
    });
    return new FormGroup<OrderFormGroupContent>({
      id: new FormControl(
        { value: orderRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      orderNumber: new FormControl(orderRawValue.orderNumber, {
        validators: [Validators.required, Validators.maxLength(20)],
      }),
      status: new FormControl(orderRawValue.status, {
        validators: [Validators.required],
      }),
      totalAmount: new FormControl(orderRawValue.totalAmount, {
        validators: [Validators.required, Validators.min(0)],
      }),
      currency: new FormControl(orderRawValue.currency, {
        validators: [Validators.required, Validators.maxLength(3)],
      }),
      paymentMethod: new FormControl(orderRawValue.paymentMethod),
      paymentStatus: new FormControl(orderRawValue.paymentStatus),
      paymentReference: new FormControl(orderRawValue.paymentReference, {
        validators: [Validators.maxLength(100)],
      }),
      shippingAddress: new FormControl(orderRawValue.shippingAddress, {
        validators: [Validators.required, Validators.maxLength(500)],
      }),
      shippingCost: new FormControl(orderRawValue.shippingCost, {
        validators: [Validators.min(0)],
      }),
      deliveryNote: new FormControl(orderRawValue.deliveryNote, {
        validators: [Validators.maxLength(1000)],
      }),
      deliveredAt: new FormControl(orderRawValue.deliveredAt),
      customer: new FormControl(orderRawValue.customer),
    });
  }

  getOrder(form: OrderFormGroup): IOrder | NewOrder {
    return this.convertOrderRawValueToOrder(form.getRawValue() as OrderFormRawValue | NewOrderFormRawValue);
  }

  resetForm(form: OrderFormGroup, order: OrderFormGroupInput): void {
    const orderRawValue = this.convertOrderToOrderRawValue({ ...this.getFormDefaults(), ...order });
    form.reset({
      ...orderRawValue,
      id: { value: orderRawValue.id, disabled: true },
    });
  }

  private getFormDefaults(): OrderFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      deliveredAt: currentTime,
    };
  }

  private convertOrderRawValueToOrder(rawOrder: OrderFormRawValue | NewOrderFormRawValue): IOrder | NewOrder {
    return {
      ...rawOrder,
      deliveredAt: dayjs(rawOrder.deliveredAt, DATE_TIME_FORMAT),
    };
  }

  private convertOrderToOrderRawValue(
    order: IOrder | (Partial<NewOrder> & OrderFormDefaults),
  ): OrderFormRawValue | PartialWithRequiredKeyOf<NewOrderFormRawValue> {
    return {
      ...order,
      deliveredAt: order.deliveredAt ? order.deliveredAt.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
