import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { ICustomer, NewCustomer } from '../customer.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts ICustomer for edit and NewCustomerFormGroupInput for create.
 */
type CustomerFormGroupInput = ICustomer | PartialWithRequiredKeyOf<NewCustomer>;

type CustomerFormDefaults = Pick<NewCustomer, 'id'>;

type CustomerFormGroupContent = {
  id: FormControl<ICustomer['id'] | NewCustomer['id']>;
  phone: FormControl<ICustomer['phone']>;
  firstName: FormControl<ICustomer['firstName']>;
  lastName: FormControl<ICustomer['lastName']>;
  email: FormControl<ICustomer['email']>;
  description: FormControl<ICustomer['description']>;
  city: FormControl<ICustomer['city']>;
};

export type CustomerFormGroup = FormGroup<CustomerFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class CustomerFormService {
  createCustomerFormGroup(customer?: CustomerFormGroupInput): CustomerFormGroup {
    const customerRawValue = {
      ...this.getFormDefaults(),
      ...(customer ?? { id: null }),
    };
    return new FormGroup<CustomerFormGroupContent>({
      id: new FormControl(
        { value: customerRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      phone: new FormControl(customerRawValue.phone, {
        validators: [Validators.required, Validators.maxLength(15)],
      }),
      firstName: new FormControl(customerRawValue.firstName, {
        validators: [Validators.required, Validators.maxLength(50)],
      }),
      lastName: new FormControl(customerRawValue.lastName, {
        validators: [Validators.required, Validators.maxLength(50)],
      }),
      email: new FormControl(customerRawValue.email, {
        validators: [Validators.maxLength(100)],
      }),
      description: new FormControl(customerRawValue.description, {
        validators: [Validators.maxLength(500)],
      }),
      city: new FormControl(customerRawValue.city, {
        validators: [Validators.maxLength(50)],
      }),
    });
  }

  getCustomer(form: CustomerFormGroup): ICustomer | NewCustomer {
    return form.getRawValue() as ICustomer | NewCustomer;
  }

  resetForm(form: CustomerFormGroup, customer: CustomerFormGroupInput): void {
    const customerRawValue = { ...this.getFormDefaults(), ...customer };
    form.reset({
      ...customerRawValue,
      id: { value: customerRawValue.id, disabled: true },
    });
  }

  private getFormDefaults(): CustomerFormDefaults {
    return {
      id: null,
    };
  }
}
