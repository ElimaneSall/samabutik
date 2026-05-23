import dayjs from 'dayjs/esm';

import { UserRole } from 'app/entities/enumerations/user-role.model';

export interface IUserStaff {
  id: number;
  email?: string | null;
  phone?: string | null;
  passwordHash?: string | null;
  role?: keyof typeof UserRole | null;
  isActive?: boolean | null;
  lastLoginAt?: dayjs.Dayjs | null;
}

export type NewUserStaff = Omit<IUserStaff, 'id'> & { id: null };
