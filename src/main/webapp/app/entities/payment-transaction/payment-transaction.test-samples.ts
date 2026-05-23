import dayjs from 'dayjs/esm';

import { IPaymentTransaction, NewPaymentTransaction } from './payment-transaction.model';

export const sampleWithRequiredData: IPaymentTransaction = {
  id: 16213,
  provider: 'WAVE',
  transactionId: 'demain au-delà',
  amount: 29511.12,
  currency: 'au ',
  status: 'SUCCESS',
};

export const sampleWithPartialData: IPaymentTransaction = {
  id: 5961,
  provider: 'WAVE',
  transactionId: 'dès que',
  amount: 3020.97,
  currency: 'cla',
  status: 'PENDING',
};

export const sampleWithFullData: IPaymentTransaction = {
  id: 8871,
  provider: 'ORANGE_MONEY',
  transactionId: 'entre-temps au point que à travers',
  amount: 17871.77,
  currency: 'en ',
  status: 'INITIATED',
  webhookPayload: 'confondre insipide',
  processedAt: dayjs('2026-05-23T12:37'),
};

export const sampleWithNewData: NewPaymentTransaction = {
  provider: 'INTOUCH',
  transactionId: 'à raison de personnel',
  amount: 4552.75,
  currency: 'jur',
  status: 'FAILED',
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
