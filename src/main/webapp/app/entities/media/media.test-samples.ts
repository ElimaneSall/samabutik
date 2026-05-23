import dayjs from 'dayjs/esm';

import { IMedia, NewMedia } from './media.model';

export const sampleWithRequiredData: IMedia = {
  id: 18219,
  url: 'https://simple-membre-a-vie.eu',
  type: 'VIDEO',
  format: 'WEBP',
  sizeBytes: 4183,
};

export const sampleWithPartialData: IMedia = {
  id: 21910,
  url: 'https://gigantesque-commissionnaire.org',
  type: 'VIDEO',
  format: 'MP4',
  sizeBytes: 29707,
  width: 15473,
  durationSec: 13879,
  isMain: true,
  altText: 'super pendant que',
};

export const sampleWithFullData: IMedia = {
  id: 26400,
  url: 'https://immense-commissionnaire.info/',
  type: 'IMAGE',
  format: 'JPG',
  sizeBytes: 23595,
  width: 9600,
  height: 7332,
  durationSec: 4230,
  isMain: true,
  displayOrder: 21794,
  altText: 'tôt monter',
  uploadedAt: dayjs('2026-05-23T11:48'),
};

export const sampleWithNewData: NewMedia = {
  url: 'https://calme-juriste.eu',
  type: 'IMAGE',
  format: 'PNG',
  sizeBytes: 3467,
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
