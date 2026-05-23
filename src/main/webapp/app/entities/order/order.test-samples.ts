import dayjs from 'dayjs/esm';

import { IOrder, NewOrder } from './order.model';

export const sampleWithRequiredData: IOrder = {
  id: 26110,
  orderNumber: 'vlan probablement',
  status: 'PAID',
  totalAmount: 31050.95,
  currency: 'por',
  shippingAddress: 'psitt hystérique',
};

export const sampleWithPartialData: IOrder = {
  id: 8176,
  orderNumber: 'lâche super',
  status: 'DELIVERED',
  totalAmount: 10614.42,
  currency: 'ter',
  paymentReference: 'près de',
  shippingAddress: 'tandis que au cas où super',
  shippingCost: 31865.76,
  deliveredAt: dayjs('2026-05-23T07:05'),
};

export const sampleWithFullData: IOrder = {
  id: 27813,
  orderNumber: 'depuis depuis',
  status: 'PENDING',
  totalAmount: 30429.02,
  currency: 'toc',
  paymentMethod: 'CASH',
  paymentStatus: 'SUCCESS',
  paymentReference: 'bien que miaou',
  shippingAddress: 'en face de',
  shippingCost: 20102.86,
  deliveryNote: 'quant à',
  deliveredAt: dayjs('2026-05-23T03:32'),
};

export const sampleWithNewData: NewOrder = {
  orderNumber: 'bzzz descendre',
  status: 'CANCELLED',
  totalAmount: 29056.03,
  currency: 'rec',
  shippingAddress: 'rectorat turquoise',
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
