import dayjs from 'dayjs/esm';

import { DiscountType } from 'app/entities/enumerations/discount-type.model';
import { IMedia } from 'app/entities/media/media.model';

export interface IPack {
  id: number;
  name?: string | null;
  description?: string | null;
  discountType?: keyof typeof DiscountType | null;
  discountValue?: number | null;
  startDate?: dayjs.Dayjs | null;
  endDate?: dayjs.Dayjs | null;
  isActive?: boolean | null;
  displayOnHomepage?: boolean | null;
  mainMedia?: Pick<IMedia, 'id'> | null;
}

export type NewPack = Omit<IPack, 'id'> & { id: null };
