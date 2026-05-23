import dayjs from 'dayjs/esm';

import { IUserStaff, NewUserStaff } from './user-staff.model';

export const sampleWithRequiredData: IUserStaff = {
  id: 2851,
  email: 'Rene.Baron@hotmail.fr',
  phone: '+33 720239840',
  passwordHash: 'via hystérique',
  role: 'MANAGER',
};

export const sampleWithPartialData: IUserStaff = {
  id: 28634,
  email: 'Lionel71@yahoo.fr',
  phone: '0486700771',
  passwordHash: 'vaincre',
  role: 'ADMIN',
};

export const sampleWithFullData: IUserStaff = {
  id: 25505,
  email: 'Scholastique20@gmail.com',
  phone: '+33 600820169',
  passwordHash: 'en vérité',
  role: 'SELLER',
  isActive: true,
  lastLoginAt: dayjs('2026-05-23T06:26'),
};

export const sampleWithNewData: NewUserStaff = {
  email: 'Herve_Barre@gmail.com',
  phone: '0500937513',
  passwordHash: 'turquoise outre',
  role: 'SELLER',
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
