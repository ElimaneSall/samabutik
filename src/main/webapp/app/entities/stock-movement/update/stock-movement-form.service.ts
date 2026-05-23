import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { IStockMovement, NewStockMovement } from '../stock-movement.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IStockMovement for edit and NewStockMovementFormGroupInput for create.
 */
type StockMovementFormGroupInput = IStockMovement | PartialWithRequiredKeyOf<NewStockMovement>;

type StockMovementFormDefaults = Pick<NewStockMovement, 'id'>;

type StockMovementFormGroupContent = {
  id: FormControl<IStockMovement['id'] | NewStockMovement['id']>;
  quantity: FormControl<IStockMovement['quantity']>;
  reason: FormControl<IStockMovement['reason']>;
  reference: FormControl<IStockMovement['reference']>;
  performedBy: FormControl<IStockMovement['performedBy']>;
  product: FormControl<IStockMovement['product']>;
};

export type StockMovementFormGroup = FormGroup<StockMovementFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class StockMovementFormService {
  createStockMovementFormGroup(stockMovement?: StockMovementFormGroupInput): StockMovementFormGroup {
    const stockMovementRawValue = {
      ...this.getFormDefaults(),
      ...(stockMovement ?? { id: null }),
    };
    return new FormGroup<StockMovementFormGroupContent>({
      id: new FormControl(
        { value: stockMovementRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      quantity: new FormControl(stockMovementRawValue.quantity, {
        validators: [Validators.required],
      }),
      reason: new FormControl(stockMovementRawValue.reason, {
        validators: [Validators.required],
      }),
      reference: new FormControl(stockMovementRawValue.reference, {
        validators: [Validators.maxLength(100)],
      }),
      performedBy: new FormControl(stockMovementRawValue.performedBy),
      product: new FormControl(stockMovementRawValue.product),
    });
  }

  getStockMovement(form: StockMovementFormGroup): IStockMovement | NewStockMovement {
    return form.getRawValue() as IStockMovement | NewStockMovement;
  }

  resetForm(form: StockMovementFormGroup, stockMovement: StockMovementFormGroupInput): void {
    const stockMovementRawValue = { ...this.getFormDefaults(), ...stockMovement };
    form.reset({
      ...stockMovementRawValue,
      id: { value: stockMovementRawValue.id, disabled: true },
    });
  }

  private getFormDefaults(): StockMovementFormDefaults {
    return {
      id: null,
    };
  }
}
