import { HttpClient, HttpResponse, httpResource } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';

import dayjs from 'dayjs/esm';
import { Observable, map } from 'rxjs';

import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { isPresent } from 'app/core/util/operators';
import { IPack, NewPack } from '../pack.model';

export type PartialUpdatePack = Partial<IPack> & Pick<IPack, 'id'>;

type RestOf<T extends IPack | NewPack> = Omit<T, 'startDate' | 'endDate'> & {
  startDate?: string | null;
  endDate?: string | null;
};

export type RestPack = RestOf<IPack>;

export type NewRestPack = RestOf<NewPack>;

export type PartialUpdateRestPack = RestOf<PartialUpdatePack>;

@Injectable()
export class PacksService {
  readonly packsParams = signal<Record<string, string | number | boolean | readonly (string | number | boolean)[]> | undefined>(undefined);
  readonly packsResource = httpResource<RestPack[]>(() => {
    const params = this.packsParams();
    if (!params) {
      return undefined;
    }
    return { url: this.resourceUrl, params };
  });
  /**
   * This signal holds the list of pack that have been fetched. It is updated when the packsResource emits a new value.
   * In case of error while fetching the packs, the signal is set to an empty array.
   */
  readonly packs = computed(() =>
    (this.packsResource.hasValue() ? this.packsResource.value() : []).map(item => this.convertValueFromServer(item)),
  );
  protected readonly applicationConfigService = inject(ApplicationConfigService);
  protected readonly resourceUrl = this.applicationConfigService.getEndpointFor('api/packs');

  protected convertValueFromServer(restPack: RestPack): IPack {
    return {
      ...restPack,
      startDate: restPack.startDate ? dayjs(restPack.startDate) : undefined,
      endDate: restPack.endDate ? dayjs(restPack.endDate) : undefined,
    };
  }
}

@Injectable({ providedIn: 'root' })
export class PackService extends PacksService {
  protected readonly http = inject(HttpClient);

  create(pack: NewPack): Observable<IPack> {
    const copy = this.convertValueFromClient(pack);
    return this.http.post<RestPack>(this.resourceUrl, copy).pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(pack: IPack): Observable<IPack> {
    const copy = this.convertValueFromClient(pack);
    return this.http
      .put<RestPack>(`${this.resourceUrl}/${encodeURIComponent(this.getPackIdentifier(pack))}`, copy)
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(pack: PartialUpdatePack): Observable<IPack> {
    const copy = this.convertValueFromClient(pack);
    return this.http
      .patch<RestPack>(`${this.resourceUrl}/${encodeURIComponent(this.getPackIdentifier(pack))}`, copy)
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<IPack> {
    return this.http.get<RestPack>(`${this.resourceUrl}/${encodeURIComponent(id)}`).pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<HttpResponse<IPack[]>> {
    const options = createRequestOption(req);
    return this.http
      .get<RestPack[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => res.clone({ body: this.convertResponseArrayFromServer(res.body!) })));
  }

  delete(id: number): Observable<undefined> {
    return this.http.delete<undefined>(`${this.resourceUrl}/${encodeURIComponent(id)}`);
  }

  getPackIdentifier(pack: Pick<IPack, 'id'>): number {
    return pack.id;
  }

  comparePack(o1: Pick<IPack, 'id'> | null, o2: Pick<IPack, 'id'> | null): boolean {
    return o1 && o2 ? this.getPackIdentifier(o1) === this.getPackIdentifier(o2) : o1 === o2;
  }

  addPackToCollectionIfMissing<Type extends Pick<IPack, 'id'>>(
    packCollection: Type[],
    ...packsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const packs: Type[] = packsToCheck.filter(isPresent);
    if (packs.length > 0) {
      const packCollectionIdentifiers = packCollection.map(packItem => this.getPackIdentifier(packItem));
      const packsToAdd = packs.filter(packItem => {
        const packIdentifier = this.getPackIdentifier(packItem);
        if (packCollectionIdentifiers.includes(packIdentifier)) {
          return false;
        }
        packCollectionIdentifiers.push(packIdentifier);
        return true;
      });
      return [...packsToAdd, ...packCollection];
    }
    return packCollection;
  }

  protected convertValueFromClient<T extends IPack | NewPack | PartialUpdatePack>(pack: T): RestOf<T> {
    return {
      ...pack,
      startDate: pack.startDate?.toJSON() ?? null,
      endDate: pack.endDate?.toJSON() ?? null,
    };
  }

  protected convertResponseFromServer(res: RestPack): IPack {
    return this.convertValueFromServer(res);
  }

  protected convertResponseArrayFromServer(res: RestPack[]): IPack[] {
    return res.map(item => this.convertValueFromServer(item));
  }
}
