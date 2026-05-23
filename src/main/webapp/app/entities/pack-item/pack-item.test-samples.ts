import { IPackItem, NewPackItem } from './pack-item.model';

export const sampleWithRequiredData: IPackItem = {
  id: 27904,
  quantity: 28359,
};

export const sampleWithPartialData: IPackItem = {
  id: 14366,
  quantity: 19605,
};

export const sampleWithFullData: IPackItem = {
  id: 27306,
  quantity: 18527,
};

export const sampleWithNewData: NewPackItem = {
  quantity: 31099,
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
