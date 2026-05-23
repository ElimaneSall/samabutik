import { StockReason } from 'app/entities/enumerations/stock-reason.model';
import { IProduct } from 'app/entities/product/product.model';
import { IUserStaff } from 'app/entities/user-staff/user-staff.model';

export interface IStockMovement {
  id: number;
  quantity?: number | null;
  reason?: keyof typeof StockReason | null;
  reference?: string | null;
  performedBy?: Pick<IUserStaff, 'id'> | null;
  product?: Pick<IProduct, 'id'> | null;
}

export type NewStockMovement = Omit<IStockMovement, 'id'> & { id: null };
