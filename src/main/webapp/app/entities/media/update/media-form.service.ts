import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';

import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IMedia, NewMedia } from '../media.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IMedia for edit and NewMediaFormGroupInput for create.
 */
type MediaFormGroupInput = IMedia | PartialWithRequiredKeyOf<NewMedia>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IMedia | NewMedia> = Omit<T, 'uploadedAt'> & {
  uploadedAt?: string | null;
};

type MediaFormRawValue = FormValueOf<IMedia>;

type NewMediaFormRawValue = FormValueOf<NewMedia>;

type MediaFormDefaults = Pick<NewMedia, 'id' | 'isMain' | 'uploadedAt'>;

type MediaFormGroupContent = {
  id: FormControl<MediaFormRawValue['id'] | NewMedia['id']>;
  url: FormControl<MediaFormRawValue['url']>;
  type: FormControl<MediaFormRawValue['type']>;
  format: FormControl<MediaFormRawValue['format']>;
  sizeBytes: FormControl<MediaFormRawValue['sizeBytes']>;
  width: FormControl<MediaFormRawValue['width']>;
  height: FormControl<MediaFormRawValue['height']>;
  durationSec: FormControl<MediaFormRawValue['durationSec']>;
  isMain: FormControl<MediaFormRawValue['isMain']>;
  displayOrder: FormControl<MediaFormRawValue['displayOrder']>;
  altText: FormControl<MediaFormRawValue['altText']>;
  uploadedAt: FormControl<MediaFormRawValue['uploadedAt']>;
  productGallery: FormControl<MediaFormRawValue['productGallery']>;
  packGallery: FormControl<MediaFormRawValue['packGallery']>;
};

export type MediaFormGroup = FormGroup<MediaFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class MediaFormService {
  createMediaFormGroup(media?: MediaFormGroupInput): MediaFormGroup {
    const mediaRawValue = this.convertMediaToMediaRawValue({
      ...this.getFormDefaults(),
      ...(media ?? { id: null }),
    });
    return new FormGroup<MediaFormGroupContent>({
      id: new FormControl(
        { value: mediaRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      url: new FormControl(mediaRawValue.url, {
        validators: [Validators.required, Validators.maxLength(500)],
      }),
      type: new FormControl(mediaRawValue.type, {
        validators: [Validators.required],
      }),
      format: new FormControl(mediaRawValue.format, {
        validators: [Validators.required],
      }),
      sizeBytes: new FormControl(mediaRawValue.sizeBytes, {
        validators: [Validators.required, Validators.min(0)],
      }),
      width: new FormControl(mediaRawValue.width, {
        validators: [Validators.min(0)],
      }),
      height: new FormControl(mediaRawValue.height, {
        validators: [Validators.min(0)],
      }),
      durationSec: new FormControl(mediaRawValue.durationSec, {
        validators: [Validators.min(0)],
      }),
      isMain: new FormControl(mediaRawValue.isMain),
      displayOrder: new FormControl(mediaRawValue.displayOrder, {
        validators: [Validators.min(0)],
      }),
      altText: new FormControl(mediaRawValue.altText, {
        validators: [Validators.maxLength(255)],
      }),
      uploadedAt: new FormControl(mediaRawValue.uploadedAt),
      productGallery: new FormControl(mediaRawValue.productGallery),
      packGallery: new FormControl(mediaRawValue.packGallery),
    });
  }

  getMedia(form: MediaFormGroup): IMedia | NewMedia {
    return this.convertMediaRawValueToMedia(form.getRawValue() as MediaFormRawValue | NewMediaFormRawValue);
  }

  resetForm(form: MediaFormGroup, media: MediaFormGroupInput): void {
    const mediaRawValue = this.convertMediaToMediaRawValue({ ...this.getFormDefaults(), ...media });
    form.reset({
      ...mediaRawValue,
      id: { value: mediaRawValue.id, disabled: true },
    });
  }

  private getFormDefaults(): MediaFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      isMain: false,
      uploadedAt: currentTime,
    };
  }

  private convertMediaRawValueToMedia(rawMedia: MediaFormRawValue | NewMediaFormRawValue): IMedia | NewMedia {
    return {
      ...rawMedia,
      uploadedAt: dayjs(rawMedia.uploadedAt, DATE_TIME_FORMAT),
    };
  }

  private convertMediaToMediaRawValue(
    media: IMedia | (Partial<NewMedia> & MediaFormDefaults),
  ): MediaFormRawValue | PartialWithRequiredKeyOf<NewMediaFormRawValue> {
    return {
      ...media,
      uploadedAt: media.uploadedAt ? media.uploadedAt.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
