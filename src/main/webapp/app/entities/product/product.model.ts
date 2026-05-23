import { IMedia } from 'app/entities/media/media.model';

export interface IProduct {
  id: number;
  sku?: string | null;
  name?: string | null;
  description?: string | null;
  price?: number | null;
  costPrice?: number | null;
  currency?: string | null;
  stock?: number | null;
  lowStockThreshold?: number | null;
  category?: string | null;
  isActive?: boolean | null;
  mainMedia?: Pick<IMedia, 'id'> | null;
}

export type NewProduct = Omit<IProduct, 'id'> & { id: null };
