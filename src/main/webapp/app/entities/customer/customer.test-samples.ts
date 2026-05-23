import { ICustomer, NewCustomer } from './customer.model';

export const sampleWithRequiredData: ICustomer = {
  id: 3366,
  phone: '+33 275252986',
  firstName: 'Emma',
  lastName: 'Rey',
};

export const sampleWithPartialData: ICustomer = {
  id: 24067,
  phone: '0429966413',
  firstName: 'Huguette',
  lastName: 'Hubert',
};

export const sampleWithFullData: ICustomer = {
  id: 4149,
  phone: '+33 315920681',
  firstName: 'Martine',
  lastName: 'Jean',
  email: 'Xavier_Dumont@gmail.com',
  description: 'conseil d’administration',
  city: 'Hyères',
};

export const sampleWithNewData: NewCustomer = {
  phone: '0771584397',
  firstName: 'Arnaud',
  lastName: 'Fontaine',
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
