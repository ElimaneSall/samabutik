import dayjs from 'dayjs/esm';

import { MediaFormat } from 'app/entities/enumerations/media-format.model';
import { MediaType } from 'app/entities/enumerations/media-type.model';
import { IPack } from 'app/entities/pack/pack.model';
import { IProduct } from 'app/entities/product/product.model';

export interface IMedia {
  id: number;
  url?: string | null;
  type?: keyof typeof MediaType | null;
  format?: keyof typeof MediaFormat | null;
  sizeBytes?: number | null;
  width?: number | null;
  height?: number | null;
  durationSec?: number | null;
  isMain?: boolean | null;
  displayOrder?: number | null;
  altText?: string | null;
  uploadedAt?: dayjs.Dayjs | null;
  productGallery?: Pick<IProduct, 'id'> | null;
  packGallery?: Pick<IPack, 'id'> | null;
}

export type NewMedia = Omit<IMedia, 'id'> & { id: null };
