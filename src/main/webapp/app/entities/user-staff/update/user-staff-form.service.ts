import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';

import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IUserStaff, NewUserStaff } from '../user-staff.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IUserStaff for edit and NewUserStaffFormGroupInput for create.
 */
type UserStaffFormGroupInput = IUserStaff | PartialWithRequiredKeyOf<NewUserStaff>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IUserStaff | NewUserStaff> = Omit<T, 'lastLoginAt'> & {
  lastLoginAt?: string | null;
};

type UserStaffFormRawValue = FormValueOf<IUserStaff>;

type NewUserStaffFormRawValue = FormValueOf<NewUserStaff>;

type UserStaffFormDefaults = Pick<NewUserStaff, 'id' | 'isActive' | 'lastLoginAt'>;

type UserStaffFormGroupContent = {
  id: FormControl<UserStaffFormRawValue['id'] | NewUserStaff['id']>;
  email: FormControl<UserStaffFormRawValue['email']>;
  phone: FormControl<UserStaffFormRawValue['phone']>;
  passwordHash: FormControl<UserStaffFormRawValue['passwordHash']>;
  role: FormControl<UserStaffFormRawValue['role']>;
  isActive: FormControl<UserStaffFormRawValue['isActive']>;
  lastLoginAt: FormControl<UserStaffFormRawValue['lastLoginAt']>;
};

export type UserStaffFormGroup = FormGroup<UserStaffFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class UserStaffFormService {
  createUserStaffFormGroup(userStaff?: UserStaffFormGroupInput): UserStaffFormGroup {
    const userStaffRawValue = this.convertUserStaffToUserStaffRawValue({
      ...this.getFormDefaults(),
      ...(userStaff ?? { id: null }),
    });
    return new FormGroup<UserStaffFormGroupContent>({
      id: new FormControl(
        { value: userStaffRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      email: new FormControl(userStaffRawValue.email, {
        validators: [Validators.required, Validators.maxLength(100)],
      }),
      phone: new FormControl(userStaffRawValue.phone, {
        validators: [Validators.required, Validators.maxLength(15)],
      }),
      passwordHash: new FormControl(userStaffRawValue.passwordHash, {
        validators: [Validators.required, Validators.maxLength(255)],
      }),
      role: new FormControl(userStaffRawValue.role, {
        validators: [Validators.required],
      }),
      isActive: new FormControl(userStaffRawValue.isActive),
      lastLoginAt: new FormControl(userStaffRawValue.lastLoginAt),
    });
  }

  getUserStaff(form: UserStaffFormGroup): IUserStaff | NewUserStaff {
    return this.convertUserStaffRawValueToUserStaff(form.getRawValue() as UserStaffFormRawValue | NewUserStaffFormRawValue);
  }

  resetForm(form: UserStaffFormGroup, userStaff: UserStaffFormGroupInput): void {
    const userStaffRawValue = this.convertUserStaffToUserStaffRawValue({ ...this.getFormDefaults(), ...userStaff });
    form.reset({
      ...userStaffRawValue,
      id: { value: userStaffRawValue.id, disabled: true },
    });
  }

  private getFormDefaults(): UserStaffFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      isActive: false,
      lastLoginAt: currentTime,
    };
  }

  private convertUserStaffRawValueToUserStaff(rawUserStaff: UserStaffFormRawValue | NewUserStaffFormRawValue): IUserStaff | NewUserStaff {
    return {
      ...rawUserStaff,
      lastLoginAt: dayjs(rawUserStaff.lastLoginAt, DATE_TIME_FORMAT),
    };
  }

  private convertUserStaffToUserStaffRawValue(
    userStaff: IUserStaff | (Partial<NewUserStaff> & UserStaffFormDefaults),
  ): UserStaffFormRawValue | PartialWithRequiredKeyOf<NewUserStaffFormRawValue> {
    return {
      ...userStaff,
      lastLoginAt: userStaff.lastLoginAt ? userStaff.lastLoginAt.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
