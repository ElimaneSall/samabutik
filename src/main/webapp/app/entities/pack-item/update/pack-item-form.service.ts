import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { IPackItem, NewPackItem } from '../pack-item.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IPackItem for edit and NewPackItemFormGroupInput for create.
 */
type PackItemFormGroupInput = IPackItem | PartialWithRequiredKeyOf<NewPackItem>;

type PackItemFormDefaults = Pick<NewPackItem, 'id'>;

type PackItemFormGroupContent = {
  id: FormControl<IPackItem['id'] | NewPackItem['id']>;
  quantity: FormControl<IPackItem['quantity']>;
  pack: FormControl<IPackItem['pack']>;
  product: FormControl<IPackItem['product']>;
};

export type PackItemFormGroup = FormGroup<PackItemFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class PackItemFormService {
  createPackItemFormGroup(packItem?: PackItemFormGroupInput): PackItemFormGroup {
    const packItemRawValue = {
      ...this.getFormDefaults(),
      ...(packItem ?? { id: null }),
    };
    return new FormGroup<PackItemFormGroupContent>({
      id: new FormControl(
        { value: packItemRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      quantity: new FormControl(packItemRawValue.quantity, {
        validators: [Validators.required, Validators.min(1)],
      }),
      pack: new FormControl(packItemRawValue.pack),
      product: new FormControl(packItemRawValue.product),
    });
  }

  getPackItem(form: PackItemFormGroup): IPackItem | NewPackItem {
    return form.getRawValue() as IPackItem | NewPackItem;
  }

  resetForm(form: PackItemFormGroup, packItem: PackItemFormGroupInput): void {
    const packItemRawValue = { ...this.getFormDefaults(), ...packItem };
    form.reset({
      ...packItemRawValue,
      id: { value: packItemRawValue.id, disabled: true },
    });
  }

  private getFormDefaults(): PackItemFormDefaults {
    return {
      id: null,
    };
  }
}
