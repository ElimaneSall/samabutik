import { IAppSettings, NewAppSettings } from './app-settings.model';

export const sampleWithRequiredData: IAppSettings = {
  id: 6070,
  paramKey: 'mince',
};

export const sampleWithPartialData: IAppSettings = {
  id: 11926,
  paramKey: 'produire extra délivrer',
  paramValue: "à l'insu de",
};

export const sampleWithFullData: IAppSettings = {
  id: 12727,
  paramKey: 'pourvu que',
  paramValue: 'snob avant de',
};

export const sampleWithNewData: NewAppSettings = {
  paramKey: 'sauvage triompher dessous',
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
