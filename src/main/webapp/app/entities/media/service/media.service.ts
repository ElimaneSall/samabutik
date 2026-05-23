import { HttpClient, HttpResponse, httpResource } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';

import dayjs from 'dayjs/esm';
import { Observable, map } from 'rxjs';

import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { isPresent } from 'app/core/util/operators';
import { IMedia, NewMedia } from '../media.model';

export type PartialUpdateMedia = Partial<IMedia> & Pick<IMedia, 'id'>;

type RestOf<T extends IMedia | NewMedia> = Omit<T, 'uploadedAt'> & {
  uploadedAt?: string | null;
};

export type RestMedia = RestOf<IMedia>;

export type NewRestMedia = RestOf<NewMedia>;

export type PartialUpdateRestMedia = RestOf<PartialUpdateMedia>;

@Injectable()
export class MediasService {
  readonly mediasParams = signal<Record<string, string | number | boolean | readonly (string | number | boolean)[]> | undefined>(undefined);
  readonly mediasResource = httpResource<RestMedia[]>(() => {
    const params = this.mediasParams();
    if (!params) {
      return undefined;
    }
    return { url: this.resourceUrl, params };
  });
  /**
   * This signal holds the list of media that have been fetched. It is updated when the mediasResource emits a new value.
   * In case of error while fetching the medias, the signal is set to an empty array.
   */
  readonly medias = computed(() =>
    (this.mediasResource.hasValue() ? this.mediasResource.value() : []).map(item => this.convertValueFromServer(item)),
  );
  protected readonly applicationConfigService = inject(ApplicationConfigService);
  protected readonly resourceUrl = this.applicationConfigService.getEndpointFor('api/media');

  protected convertValueFromServer(restMedia: RestMedia): IMedia {
    return {
      ...restMedia,
      uploadedAt: restMedia.uploadedAt ? dayjs(restMedia.uploadedAt) : undefined,
    };
  }
}

@Injectable({ providedIn: 'root' })
export class MediaService extends MediasService {
  protected readonly http = inject(HttpClient);

  create(media: NewMedia): Observable<IMedia> {
    const copy = this.convertValueFromClient(media);
    return this.http.post<RestMedia>(this.resourceUrl, copy).pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(media: IMedia): Observable<IMedia> {
    const copy = this.convertValueFromClient(media);
    return this.http
      .put<RestMedia>(`${this.resourceUrl}/${encodeURIComponent(this.getMediaIdentifier(media))}`, copy)
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(media: PartialUpdateMedia): Observable<IMedia> {
    const copy = this.convertValueFromClient(media);
    return this.http
      .patch<RestMedia>(`${this.resourceUrl}/${encodeURIComponent(this.getMediaIdentifier(media))}`, copy)
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<IMedia> {
    return this.http.get<RestMedia>(`${this.resourceUrl}/${encodeURIComponent(id)}`).pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<HttpResponse<IMedia[]>> {
    const options = createRequestOption(req);
    return this.http
      .get<RestMedia[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => res.clone({ body: this.convertResponseArrayFromServer(res.body!) })));
  }

  delete(id: number): Observable<undefined> {
    return this.http.delete<undefined>(`${this.resourceUrl}/${encodeURIComponent(id)}`);
  }

  getMediaIdentifier(media: Pick<IMedia, 'id'>): number {
    return media.id;
  }

  compareMedia(o1: Pick<IMedia, 'id'> | null, o2: Pick<IMedia, 'id'> | null): boolean {
    return o1 && o2 ? this.getMediaIdentifier(o1) === this.getMediaIdentifier(o2) : o1 === o2;
  }

  addMediaToCollectionIfMissing<Type extends Pick<IMedia, 'id'>>(
    mediaCollection: Type[],
    ...mediasToCheck: (Type | null | undefined)[]
  ): Type[] {
    const medias: Type[] = mediasToCheck.filter(isPresent);
    if (medias.length > 0) {
      const mediaCollectionIdentifiers = mediaCollection.map(mediaItem => this.getMediaIdentifier(mediaItem));
      const mediasToAdd = medias.filter(mediaItem => {
        const mediaIdentifier = this.getMediaIdentifier(mediaItem);
        if (mediaCollectionIdentifiers.includes(mediaIdentifier)) {
          return false;
        }
        mediaCollectionIdentifiers.push(mediaIdentifier);
        return true;
      });
      return [...mediasToAdd, ...mediaCollection];
    }
    return mediaCollection;
  }

  protected convertValueFromClient<T extends IMedia | NewMedia | PartialUpdateMedia>(media: T): RestOf<T> {
    return {
      ...media,
      uploadedAt: media.uploadedAt?.toJSON() ?? null,
    };
  }

  protected convertResponseFromServer(res: RestMedia): IMedia {
    return this.convertValueFromServer(res);
  }

  protected convertResponseArrayFromServer(res: RestMedia[]): IMedia[] {
    return res.map(item => this.convertValueFromServer(item));
  }
}
