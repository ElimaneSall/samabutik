import { IOrderItem, NewOrderItem } from './order-item.model';

export const sampleWithRequiredData: IOrderItem = {
  id: 16549,
  productName: 'combien avex dès que',
  productSku: 'autrement',
  quantity: 29378,
  unitPrice: 11114.2,
  subtotal: 24138.53,
};

export const sampleWithPartialData: IOrderItem = {
  id: 27299,
  productName: 'derechef spécialiste déjà',
  productSku: 'membre à vie au point que vlan',
  quantity: 17181,
  unitPrice: 30361.57,
  subtotal: 20753.72,
};

export const sampleWithFullData: IOrderItem = {
  id: 6728,
  productName: 'barrer de peur que',
  productSku: "membre du personnel à l'encontre de",
  quantity: 17938,
  unitPrice: 26542.46,
  subtotal: 16249.51,
  isPackItem: true,
};

export const sampleWithNewData: NewOrderItem = {
  productName: 'chut au-dessous de',
  productSku: 'très',
  quantity: 9526,
  unitPrice: 25451.42,
  subtotal: 7071.96,
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
