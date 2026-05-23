import { beforeEach, describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';

import { sampleWithNewData, sampleWithRequiredData } from '../payment-transaction.test-samples';

import { PaymentTransactionFormService } from './payment-transaction-form.service';

describe('PaymentTransaction Form Service', () => {
  let service: PaymentTransactionFormService;

  beforeEach(() => {
    service = TestBed.inject(PaymentTransactionFormService);
  });

  describe('Service methods', () => {
    describe('createPaymentTransactionFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createPaymentTransactionFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            provider: expect.any(Object),
            transactionId: expect.any(Object),
            amount: expect.any(Object),
            currency: expect.any(Object),
            status: expect.any(Object),
            webhookPayload: expect.any(Object),
            processedAt: expect.any(Object),
            order: expect.any(Object),
          }),
        );
      });

      it('passing IPaymentTransaction should create a new form with FormGroup', () => {
        const formGroup = service.createPaymentTransactionFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            provider: expect.any(Object),
            transactionId: expect.any(Object),
            amount: expect.any(Object),
            currency: expect.any(Object),
            status: expect.any(Object),
            webhookPayload: expect.any(Object),
            processedAt: expect.any(Object),
            order: expect.any(Object),
          }),
        );
      });
    });

    describe('getPaymentTransaction', () => {
      it('should return NewPaymentTransaction for default PaymentTransaction initial value', () => {
        const formGroup = service.createPaymentTransactionFormGroup(sampleWithNewData);

        const paymentTransaction = service.getPaymentTransaction(formGroup);

        expect(paymentTransaction).toMatchObject(sampleWithNewData);
      });

      it('should return NewPaymentTransaction for empty PaymentTransaction initial value', () => {
        const formGroup = service.createPaymentTransactionFormGroup();

        const paymentTransaction = service.getPaymentTransaction(formGroup);

        expect(paymentTransaction).toMatchObject({});
      });

      it('should return IPaymentTransaction', () => {
        const formGroup = service.createPaymentTransactionFormGroup(sampleWithRequiredData);

        const paymentTransaction = service.getPaymentTransaction(formGroup);

        expect(paymentTransaction).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IPaymentTransaction should not enable id FormControl', () => {
        const formGroup = service.createPaymentTransactionFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewPaymentTransaction should disable id FormControl', () => {
        const formGroup = service.createPaymentTransactionFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
