import dayjs from 'dayjs/esm';

import { PaymentProvider } from 'app/entities/enumerations/payment-provider.model';
import { TransactionStatus } from 'app/entities/enumerations/transaction-status.model';
import { IOrder } from 'app/entities/order/order.model';

export interface IPaymentTransaction {
  id: number;
  provider?: keyof typeof PaymentProvider | null;
  transactionId?: string | null;
  amount?: number | null;
  currency?: string | null;
  status?: keyof typeof TransactionStatus | null;
  webhookPayload?: string | null;
  processedAt?: dayjs.Dayjs | null;
  order?: Pick<IOrder, 'id'> | null;
}

export type NewPaymentTransaction = Omit<IPaymentTransaction, 'id'> & { id: null };
