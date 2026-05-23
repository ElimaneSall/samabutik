import { IProduct, NewProduct } from './product.model';

export const sampleWithRequiredData: IProduct = {
  id: 11737,
  sku: 'drelin au-dessous',
  name: 'oh alors que',
  price: 16146.92,
  stock: 2897,
};

export const sampleWithPartialData: IProduct = {
  id: 15347,
  sku: 'au-delà habile',
  name: 'clac pin-pon parlementaire',
  price: 4492.48,
  costPrice: 319.09,
  stock: 17780,
};

export const sampleWithFullData: IProduct = {
  id: 4403,
  sku: 'actionnaire',
  name: 'depuis en',
  description: 'drelin miaou',
  price: 2989.07,
  costPrice: 1604.77,
  currency: 'du ',
  stock: 29887,
  lowStockThreshold: 21321,
  category: 'aïe',
  isActive: false,
};

export const sampleWithNewData: NewProduct = {
  sku: 'hormis fréquenter tandis que',
  name: 'envers magnifique hors',
  price: 7532.66,
  stock: 30545,
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
