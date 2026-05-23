import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { IProduct, NewProduct } from '../product.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IProduct for edit and NewProductFormGroupInput for create.
 */
type ProductFormGroupInput = IProduct | PartialWithRequiredKeyOf<NewProduct>;

type ProductFormDefaults = Pick<NewProduct, 'id' | 'isActive'>;

type ProductFormGroupContent = {
  id: FormControl<IProduct['id'] | NewProduct['id']>;
  sku: FormControl<IProduct['sku']>;
  name: FormControl<IProduct['name']>;
  description: FormControl<IProduct['description']>;
  price: FormControl<IProduct['price']>;
  costPrice: FormControl<IProduct['costPrice']>;
  currency: FormControl<IProduct['currency']>;
  stock: FormControl<IProduct['stock']>;
  lowStockThreshold: FormControl<IProduct['lowStockThreshold']>;
  category: FormControl<IProduct['category']>;
  isActive: FormControl<IProduct['isActive']>;
  mainMedia: FormControl<IProduct['mainMedia']>;
};

export type ProductFormGroup = FormGroup<ProductFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class ProductFormService {
  createProductFormGroup(product?: ProductFormGroupInput): ProductFormGroup {
    const productRawValue = {
      ...this.getFormDefaults(),
      ...(product ?? { id: null }),
    };
    return new FormGroup<ProductFormGroupContent>({
      id: new FormControl(
        { value: productRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      sku: new FormControl(productRawValue.sku, {
        validators: [Validators.required, Validators.maxLength(50)],
      }),
      name: new FormControl(productRawValue.name, {
        validators: [Validators.required, Validators.maxLength(100)],
      }),
      description: new FormControl(productRawValue.description, {
        validators: [Validators.maxLength(2000)],
      }),
      price: new FormControl(productRawValue.price, {
        validators: [Validators.required, Validators.min(0)],
      }),
      costPrice: new FormControl(productRawValue.costPrice, {
        validators: [Validators.min(0)],
      }),
      currency: new FormControl(productRawValue.currency, {
        validators: [Validators.maxLength(3)],
      }),
      stock: new FormControl(productRawValue.stock, {
        validators: [Validators.required, Validators.min(0)],
      }),
      lowStockThreshold: new FormControl(productRawValue.lowStockThreshold, {
        validators: [Validators.min(0)],
      }),
      category: new FormControl(productRawValue.category, {
        validators: [Validators.maxLength(50)],
      }),
      isActive: new FormControl(productRawValue.isActive),
      mainMedia: new FormControl(productRawValue.mainMedia),
    });
  }

  getProduct(form: ProductFormGroup): IProduct | NewProduct {
    return form.getRawValue() as IProduct | NewProduct;
  }

  resetForm(form: ProductFormGroup, product: ProductFormGroupInput): void {
    const productRawValue = { ...this.getFormDefaults(), ...product };
    form.reset({
      ...productRawValue,
      id: { value: productRawValue.id, disabled: true },
    });
  }

  private getFormDefaults(): ProductFormDefaults {
    return {
      id: null,
      isActive: false,
    };
  }
}
