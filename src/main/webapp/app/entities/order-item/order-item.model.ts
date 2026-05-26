import { IOrder } from 'app/entities/order/order.model';
import { IProduct } from 'app/entities/product/product.model';

export interface IOrderItem {
  id: number;
  productName?: string | null;
  productSku?: string | null;
  quantity?: number | null;
  unitPrice?: number | null;
  subtotal?: number | null;
  isPackItem?: boolean | null;
  productSnapshot?: Pick<IProduct, 'id' | 'mainMedia'> | null;
  order?: Pick<IOrder, 'id'> | null;
}

export type NewOrderItem = Omit<IOrderItem, 'id'> & { id: null };
