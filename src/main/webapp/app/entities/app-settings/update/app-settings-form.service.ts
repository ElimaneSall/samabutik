import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { IAppSettings, NewAppSettings } from '../app-settings.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IAppSettings for edit and NewAppSettingsFormGroupInput for create.
 */
type AppSettingsFormGroupInput = IAppSettings | PartialWithRequiredKeyOf<NewAppSettings>;

type AppSettingsFormDefaults = Pick<NewAppSettings, 'id'>;

type AppSettingsFormGroupContent = {
  id: FormControl<IAppSettings['id'] | NewAppSettings['id']>;
  paramKey: FormControl<IAppSettings['paramKey']>;
  paramValue: FormControl<IAppSettings['paramValue']>;
};

export type AppSettingsFormGroup = FormGroup<AppSettingsFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class AppSettingsFormService {
  createAppSettingsFormGroup(appSettings?: AppSettingsFormGroupInput): AppSettingsFormGroup {
    const appSettingsRawValue = {
      ...this.getFormDefaults(),
      ...(appSettings ?? { id: null }),
    };
    return new FormGroup<AppSettingsFormGroupContent>({
      id: new FormControl(
        { value: appSettingsRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      paramKey: new FormControl(appSettingsRawValue.paramKey, {
        validators: [Validators.required],
      }),
      paramValue: new FormControl(appSettingsRawValue.paramValue),
    });
  }

  getAppSettings(form: AppSettingsFormGroup): IAppSettings | NewAppSettings {
    return form.getRawValue() as IAppSettings | NewAppSettings;
  }

  resetForm(form: AppSettingsFormGroup, appSettings: AppSettingsFormGroupInput): void {
    const appSettingsRawValue = { ...this.getFormDefaults(), ...appSettings };
    form.reset({
      ...appSettingsRawValue,
      id: { value: appSettingsRawValue.id, disabled: true },
    });
  }

  private getFormDefaults(): AppSettingsFormDefaults {
    return {
      id: null,
    };
  }
}
