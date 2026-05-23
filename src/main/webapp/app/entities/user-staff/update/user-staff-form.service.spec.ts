import { beforeEach, describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';

import { sampleWithNewData, sampleWithRequiredData } from '../user-staff.test-samples';

import { UserStaffFormService } from './user-staff-form.service';

describe('UserStaff Form Service', () => {
  let service: UserStaffFormService;

  beforeEach(() => {
    service = TestBed.inject(UserStaffFormService);
  });

  describe('Service methods', () => {
    describe('createUserStaffFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createUserStaffFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            email: expect.any(Object),
            phone: expect.any(Object),
            passwordHash: expect.any(Object),
            role: expect.any(Object),
            isActive: expect.any(Object),
            lastLoginAt: expect.any(Object),
          }),
        );
      });

      it('passing IUserStaff should create a new form with FormGroup', () => {
        const formGroup = service.createUserStaffFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            email: expect.any(Object),
            phone: expect.any(Object),
            passwordHash: expect.any(Object),
            role: expect.any(Object),
            isActive: expect.any(Object),
            lastLoginAt: expect.any(Object),
          }),
        );
      });
    });

    describe('getUserStaff', () => {
      it('should return NewUserStaff for default UserStaff initial value', () => {
        const formGroup = service.createUserStaffFormGroup(sampleWithNewData);

        const userStaff = service.getUserStaff(formGroup);

        expect(userStaff).toMatchObject(sampleWithNewData);
      });

      it('should return NewUserStaff for empty UserStaff initial value', () => {
        const formGroup = service.createUserStaffFormGroup();

        const userStaff = service.getUserStaff(formGroup);

        expect(userStaff).toMatchObject({});
      });

      it('should return IUserStaff', () => {
        const formGroup = service.createUserStaffFormGroup(sampleWithRequiredData);

        const userStaff = service.getUserStaff(formGroup);

        expect(userStaff).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IUserStaff should not enable id FormControl', () => {
        const formGroup = service.createUserStaffFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewUserStaff should disable id FormControl', () => {
        const formGroup = service.createUserStaffFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
