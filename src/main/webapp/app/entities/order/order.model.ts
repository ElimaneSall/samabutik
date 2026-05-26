import dayjs from 'dayjs/esm';

import { ICustomer } from 'app/entities/customer/customer.model';
import { OrderStatus } from 'app/entities/enumerations/order-status.model';
import { PaymentMethod } from 'app/entities/enumerations/payment-method.model';
import { PaymentStatus } from 'app/entities/enumerations/payment-status.model';

export interface IOrder {
  id: number;
  orderNumber?: string | null;
  status?: keyof typeof OrderStatus | null;
  totalAmount?: number | null;
  currency?: string | null;
  paymentMethod?: keyof typeof PaymentMethod | null;
  paymentStatus?: keyof typeof PaymentStatus | null;
  paymentReference?: string | null;
  shippingAddress?: string | null;
  shippingCost?: number | null;
  deliveryNote?: string | null;
  deliveredAt?: dayjs.Dayjs | null;
  customer?: Pick<ICustomer, 'id' | 'firstName'> | null;
}

export type NewOrder = Omit<IOrder, 'id'> & { id: null };
