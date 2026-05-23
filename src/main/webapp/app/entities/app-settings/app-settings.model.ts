export interface IAppSettings {
  id: number;
  paramKey?: string | null;
  paramValue?: string | null;
}

export type NewAppSettings = Omit<IAppSettings, 'id'> & { id: null };
