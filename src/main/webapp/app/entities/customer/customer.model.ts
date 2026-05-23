export interface ICustomer {
  id: number;
  phone?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  description?: string | null;
  city?: string | null;
}

export type NewCustomer = Omit<ICustomer, 'id'> & { id: null };
