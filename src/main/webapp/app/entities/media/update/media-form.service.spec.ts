import { beforeEach, describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';

import { sampleWithNewData, sampleWithRequiredData } from '../media.test-samples';

import { MediaFormService } from './media-form.service';

describe('Media Form Service', () => {
  let service: MediaFormService;

  beforeEach(() => {
    service = TestBed.inject(MediaFormService);
  });

  describe('Service methods', () => {
    describe('createMediaFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createMediaFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            url: expect.any(Object),
            type: expect.any(Object),
            format: expect.any(Object),
            sizeBytes: expect.any(Object),
            width: expect.any(Object),
            height: expect.any(Object),
            durationSec: expect.any(Object),
            isMain: expect.any(Object),
            displayOrder: expect.any(Object),
            altText: expect.any(Object),
            uploadedAt: expect.any(Object),
            productGallery: expect.any(Object),
            packGallery: expect.any(Object),
          }),
        );
      });

      it('passing IMedia should create a new form with FormGroup', () => {
        const formGroup = service.createMediaFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            url: expect.any(Object),
            type: expect.any(Object),
            format: expect.any(Object),
            sizeBytes: expect.any(Object),
            width: expect.any(Object),
            height: expect.any(Object),
            durationSec: expect.any(Object),
            isMain: expect.any(Object),
            displayOrder: expect.any(Object),
            altText: expect.any(Object),
            uploadedAt: expect.any(Object),
            productGallery: expect.any(Object),
            packGallery: expect.any(Object),
          }),
        );
      });
    });

    describe('getMedia', () => {
      it('should return NewMedia for default Media initial value', () => {
        const formGroup = service.createMediaFormGroup(sampleWithNewData);

        const media = service.getMedia(formGroup);

        expect(media).toMatchObject(sampleWithNewData);
      });

      it('should return NewMedia for empty Media initial value', () => {
        const formGroup = service.createMediaFormGroup();

        const media = service.getMedia(formGroup);

        expect(media).toMatchObject({});
      });

      it('should return IMedia', () => {
        const formGroup = service.createMediaFormGroup(sampleWithRequiredData);

        const media = service.getMedia(formGroup);

        expect(media).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IMedia should not enable id FormControl', () => {
        const formGroup = service.createMediaFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewMedia should disable id FormControl', () => {
        const formGroup = service.createMediaFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
