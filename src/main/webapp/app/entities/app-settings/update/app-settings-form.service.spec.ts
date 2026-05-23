import { beforeEach, describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';

import { sampleWithNewData, sampleWithRequiredData } from '../app-settings.test-samples';

import { AppSettingsFormService } from './app-settings-form.service';

describe('AppSettings Form Service', () => {
  let service: AppSettingsFormService;

  beforeEach(() => {
    service = TestBed.inject(AppSettingsFormService);
  });

  describe('Service methods', () => {
    describe('createAppSettingsFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createAppSettingsFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            paramKey: expect.any(Object),
            paramValue: expect.any(Object),
          }),
        );
      });

      it('passing IAppSettings should create a new form with FormGroup', () => {
        const formGroup = service.createAppSettingsFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            paramKey: expect.any(Object),
            paramValue: expect.any(Object),
          }),
        );
      });
    });

    describe('getAppSettings', () => {
      it('should return NewAppSettings for default AppSettings initial value', () => {
        const formGroup = service.createAppSettingsFormGroup(sampleWithNewData);

        const appSettings = service.getAppSettings(formGroup);

        expect(appSettings).toMatchObject(sampleWithNewData);
      });

      it('should return NewAppSettings for empty AppSettings initial value', () => {
        const formGroup = service.createAppSettingsFormGroup();

        const appSettings = service.getAppSettings(formGroup);

        expect(appSettings).toMatchObject({});
      });

      it('should return IAppSettings', () => {
        const formGroup = service.createAppSettingsFormGroup(sampleWithRequiredData);

        const appSettings = service.getAppSettings(formGroup);

        expect(appSettings).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IAppSettings should not enable id FormControl', () => {
        const formGroup = service.createAppSettingsFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewAppSettings should disable id FormControl', () => {
        const formGroup = service.createAppSettingsFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
