import { IStockMovement, NewStockMovement } from './stock-movement.model';

export const sampleWithRequiredData: IStockMovement = {
  id: 16284,
  quantity: 27474,
  reason: 'DAMAGED',
};

export const sampleWithPartialData: IStockMovement = {
  id: 25661,
  quantity: 1186,
  reason: 'PACK_ASSEMBLY',
};

export const sampleWithFullData: IStockMovement = {
  id: 31835,
  quantity: 7951,
  reason: 'PACK_ASSEMBLY',
  reference: 'même si jusqu’à ce que rectangulaire',
};

export const sampleWithNewData: NewStockMovement = {
  quantity: 2569,
  reason: 'ADJUSTMENT',
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
