import dayjs from 'dayjs/esm';

import { IPack, NewPack } from './pack.model';

export const sampleWithRequiredData: IPack = {
  id: 15548,
  name: 'au défaut de spécialiste pin-pon',
  discountType: 'FIXED',
  discountValue: 31777.6,
  startDate: dayjs('2026-05-23T03:46'),
  endDate: dayjs('2026-05-23T11:35'),
};

export const sampleWithPartialData: IPack = {
  id: 29070,
  name: 'euh',
  discountType: 'FIXED',
  discountValue: 5928.64,
  startDate: dayjs('2026-05-23T07:45'),
  endDate: dayjs('2026-05-22T20:52'),
  isActive: true,
};

export const sampleWithFullData: IPack = {
  id: 14553,
  name: 'serviable juriste commissionnaire',
  description: 'mal guide tsoin-tsoin',
  discountType: 'PERCENT',
  discountValue: 5626.02,
  startDate: dayjs('2026-05-23T04:07'),
  endDate: dayjs('2026-05-22T19:52'),
  isActive: true,
  displayOnHomepage: false,
};

export const sampleWithNewData: NewPack = {
  name: 'alors placide encourager',
  discountType: 'FIXED',
  discountValue: 15645.54,
  startDate: dayjs('2026-05-22T20:40'),
  endDate: dayjs('2026-05-23T07:34'),
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
