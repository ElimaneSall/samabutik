import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';

import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IPack, NewPack } from '../pack.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IPack for edit and NewPackFormGroupInput for create.
 */
type PackFormGroupInput = IPack | PartialWithRequiredKeyOf<NewPack>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IPack | NewPack> = Omit<T, 'startDate' | 'endDate'> & {
  startDate?: string | null;
  endDate?: string | null;
};

type PackFormRawValue = FormValueOf<IPack>;

type NewPackFormRawValue = FormValueOf<NewPack>;

type PackFormDefaults = Pick<NewPack, 'id' | 'startDate' | 'endDate' | 'isActive' | 'displayOnHomepage'>;

type PackFormGroupContent = {
  id: FormControl<PackFormRawValue['id'] | NewPack['id']>;
  name: FormControl<PackFormRawValue['name']>;
  description: FormControl<PackFormRawValue['description']>;
  discountType: FormControl<PackFormRawValue['discountType']>;
  discountValue: FormControl<PackFormRawValue['discountValue']>;
  startDate: FormControl<PackFormRawValue['startDate']>;
  endDate: FormControl<PackFormRawValue['endDate']>;
  isActive: FormControl<PackFormRawValue['isActive']>;
  displayOnHomepage: FormControl<PackFormRawValue['displayOnHomepage']>;
  mainMedia: FormControl<PackFormRawValue['mainMedia']>;
};

export type PackFormGroup = FormGroup<PackFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class PackFormService {
  createPackFormGroup(pack?: PackFormGroupInput): PackFormGroup {
    const packRawValue = this.convertPackToPackRawValue({
      ...this.getFormDefaults(),
      ...(pack ?? { id: null }),
    });
    return new FormGroup<PackFormGroupContent>({
      id: new FormControl(
        { value: packRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      name: new FormControl(packRawValue.name, {
        validators: [Validators.required, Validators.maxLength(100)],
      }),
      description: new FormControl(packRawValue.description, {
        validators: [Validators.maxLength(2000)],
      }),
      discountType: new FormControl(packRawValue.discountType, {
        validators: [Validators.required],
      }),
      discountValue: new FormControl(packRawValue.discountValue, {
        validators: [Validators.required, Validators.min(0)],
      }),
      startDate: new FormControl(packRawValue.startDate, {
        validators: [Validators.required],
      }),
      endDate: new FormControl(packRawValue.endDate, {
        validators: [Validators.required],
      }),
      isActive: new FormControl(packRawValue.isActive),
      displayOnHomepage: new FormControl(packRawValue.displayOnHomepage),
      mainMedia: new FormControl(packRawValue.mainMedia),
    });
  }

  getPack(form: PackFormGroup): IPack | NewPack {
    return this.convertPackRawValueToPack(form.getRawValue() as PackFormRawValue | NewPackFormRawValue);
  }

  resetForm(form: PackFormGroup, pack: PackFormGroupInput): void {
    const packRawValue = this.convertPackToPackRawValue({ ...this.getFormDefaults(), ...pack });
    form.reset({
      ...packRawValue,
      id: { value: packRawValue.id, disabled: true },
    });
  }

  private getFormDefaults(): PackFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      startDate: currentTime,
      endDate: currentTime,
      isActive: false,
      displayOnHomepage: false,
    };
  }

  private convertPackRawValueToPack(rawPack: PackFormRawValue | NewPackFormRawValue): IPack | NewPack {
    return {
      ...rawPack,
      startDate: dayjs(rawPack.startDate, DATE_TIME_FORMAT),
      endDate: dayjs(rawPack.endDate, DATE_TIME_FORMAT),
    };
  }

  private convertPackToPackRawValue(
    pack: IPack | (Partial<NewPack> & PackFormDefaults),
  ): PackFormRawValue | PartialWithRequiredKeyOf<NewPackFormRawValue> {
    return {
      ...pack,
      startDate: pack.startDate ? pack.startDate.format(DATE_TIME_FORMAT) : undefined,
      endDate: pack.endDate ? pack.endDate.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
