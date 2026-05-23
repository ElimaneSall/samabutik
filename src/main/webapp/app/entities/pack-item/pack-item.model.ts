import { IPack } from 'app/entities/pack/pack.model';
import { IProduct } from 'app/entities/product/product.model';

export interface IPackItem {
  id: number;
  quantity?: number | null;
  pack?: Pick<IPack, 'id'> | null;
  product?: Pick<IProduct, 'id'> | null;
}

export type NewPackItem = Omit<IPackItem, 'id'> & { id: null };
