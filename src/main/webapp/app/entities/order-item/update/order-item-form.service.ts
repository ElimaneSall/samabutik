import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { IOrderItem, NewOrderItem } from '../order-item.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IOrderItem for edit and NewOrderItemFormGroupInput for create.
 */
type OrderItemFormGroupInput = IOrderItem | PartialWithRequiredKeyOf<NewOrderItem>;

type OrderItemFormDefaults = Pick<NewOrderItem, 'id' | 'isPackItem'>;

type OrderItemFormGroupContent = {
  id: FormControl<IOrderItem['id'] | NewOrderItem['id']>;
  productName: FormControl<IOrderItem['productName']>;
  productSku: FormControl<IOrderItem['productSku']>;
  quantity: FormControl<IOrderItem['quantity']>;
  unitPrice: FormControl<IOrderItem['unitPrice']>;
  subtotal: FormControl<IOrderItem['subtotal']>;
  isPackItem: FormControl<IOrderItem['isPackItem']>;
  productSnapshot: FormControl<IOrderItem['productSnapshot']>;
  order: FormControl<IOrderItem['order']>;
};

export type OrderItemFormGroup = FormGroup<OrderItemFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class OrderItemFormService {
  createOrderItemFormGroup(orderItem?: OrderItemFormGroupInput): OrderItemFormGroup {
    const orderItemRawValue = {
      ...this.getFormDefaults(),
      ...(orderItem ?? { id: null }),
    };
    return new FormGroup<OrderItemFormGroupContent>({
      id: new FormControl(
        { value: orderItemRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      productName: new FormControl(orderItemRawValue.productName, {
        validators: [Validators.required, Validators.maxLength(100)],
      }),
      productSku: new FormControl(orderItemRawValue.productSku, {
        validators: [Validators.required, Validators.maxLength(50)],
      }),
      quantity: new FormControl(orderItemRawValue.quantity, {
        validators: [Validators.required, Validators.min(1)],
      }),
      unitPrice: new FormControl(orderItemRawValue.unitPrice, {
        validators: [Validators.required, Validators.min(0)],
      }),
      subtotal: new FormControl(orderItemRawValue.subtotal, {
        validators: [Validators.required, Validators.min(0)],
      }),
      isPackItem: new FormControl(orderItemRawValue.isPackItem),
      productSnapshot: new FormControl(orderItemRawValue.productSnapshot),
      order: new FormControl(orderItemRawValue.order),
    });
  }

  getOrderItem(form: OrderItemFormGroup): IOrderItem | NewOrderItem {
    return form.getRawValue() as IOrderItem | NewOrderItem;
  }

  resetForm(form: OrderItemFormGroup, orderItem: OrderItemFormGroupInput): void {
    const orderItemRawValue = { ...this.getFormDefaults(), ...orderItem };
    form.reset({
      ...orderItemRawValue,
      id: { value: orderItemRawValue.id, disabled: true },
    });
  }

  private getFormDefaults(): OrderItemFormDefaults {
    return {
      id: null,
      isPackItem: false,
    };
  }
}
