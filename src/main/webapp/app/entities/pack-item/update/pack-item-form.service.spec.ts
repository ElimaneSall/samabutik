import { beforeEach, describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';

import { sampleWithNewData, sampleWithRequiredData } from '../pack-item.test-samples';

import { PackItemFormService } from './pack-item-form.service';

describe('PackItem Form Service', () => {
  let service: PackItemFormService;

  beforeEach(() => {
    service = TestBed.inject(PackItemFormService);
  });

  describe('Service methods', () => {
    describe('createPackItemFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createPackItemFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            quantity: expect.any(Object),
            pack: expect.any(Object),
            product: expect.any(Object),
          }),
        );
      });

      it('passing IPackItem should create a new form with FormGroup', () => {
        const formGroup = service.createPackItemFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            quantity: expect.any(Object),
            pack: expect.any(Object),
            product: expect.any(Object),
          }),
        );
      });
    });

    describe('getPackItem', () => {
      it('should return NewPackItem for default PackItem initial value', () => {
        const formGroup = service.createPackItemFormGroup(sampleWithNewData);

        const packItem = service.getPackItem(formGroup);

        expect(packItem).toMatchObject(sampleWithNewData);
      });

      it('should return NewPackItem for empty PackItem initial value', () => {
        const formGroup = service.createPackItemFormGroup();

        const packItem = service.getPackItem(formGroup);

        expect(packItem).toMatchObject({});
      });

      it('should return IPackItem', () => {
        const formGroup = service.createPackItemFormGroup(sampleWithRequiredData);

        const packItem = service.getPackItem(formGroup);

        expect(packItem).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IPackItem should not enable id FormControl', () => {
        const formGroup = service.createPackItemFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewPackItem should disable id FormControl', () => {
        const formGroup = service.createPackItemFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
