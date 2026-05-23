import { HttpClient, HttpResponse, httpResource } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';

import { Observable } from 'rxjs';

import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { isPresent } from 'app/core/util/operators';
import { IPackItem, NewPackItem } from '../pack-item.model';

export type PartialUpdatePackItem = Partial<IPackItem> & Pick<IPackItem, 'id'>;

@Injectable()
export class PackItemsService {
  readonly packItemsParams = signal<Record<string, string | number | boolean | readonly (string | number | boolean)[]> | undefined>(
    undefined,
  );
  readonly packItemsResource = httpResource<IPackItem[]>(() => {
    const params = this.packItemsParams();
    if (!params) {
      return undefined;
    }
    return { url: this.resourceUrl, params };
  });
  /**
   * This signal holds the list of packItem that have been fetched. It is updated when the packItemsResource emits a new value.
   * In case of error while fetching the packItems, the signal is set to an empty array.
   */
  readonly packItems = computed(() => (this.packItemsResource.hasValue() ? this.packItemsResource.value() : []));
  protected readonly applicationConfigService = inject(ApplicationConfigService);
  protected readonly resourceUrl = this.applicationConfigService.getEndpointFor('api/pack-items');
}

@Injectable({ providedIn: 'root' })
export class PackItemService extends PackItemsService {
  protected readonly http = inject(HttpClient);

  create(packItem: NewPackItem): Observable<IPackItem> {
    return this.http.post<IPackItem>(this.resourceUrl, packItem);
  }

  update(packItem: IPackItem): Observable<IPackItem> {
    return this.http.put<IPackItem>(`${this.resourceUrl}/${encodeURIComponent(this.getPackItemIdentifier(packItem))}`, packItem);
  }

  partialUpdate(packItem: PartialUpdatePackItem): Observable<IPackItem> {
    return this.http.patch<IPackItem>(`${this.resourceUrl}/${encodeURIComponent(this.getPackItemIdentifier(packItem))}`, packItem);
  }

  find(id: number): Observable<IPackItem> {
    return this.http.get<IPackItem>(`${this.resourceUrl}/${encodeURIComponent(id)}`);
  }

  query(req?: any): Observable<HttpResponse<IPackItem[]>> {
    const options = createRequestOption(req);
    return this.http.get<IPackItem[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<undefined> {
    return this.http.delete<undefined>(`${this.resourceUrl}/${encodeURIComponent(id)}`);
  }

  getPackItemIdentifier(packItem: Pick<IPackItem, 'id'>): number {
    return packItem.id;
  }

  comparePackItem(o1: Pick<IPackItem, 'id'> | null, o2: Pick<IPackItem, 'id'> | null): boolean {
    return o1 && o2 ? this.getPackItemIdentifier(o1) === this.getPackItemIdentifier(o2) : o1 === o2;
  }

  addPackItemToCollectionIfMissing<Type extends Pick<IPackItem, 'id'>>(
    packItemCollection: Type[],
    ...packItemsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const packItems: Type[] = packItemsToCheck.filter(isPresent);
    if (packItems.length > 0) {
      const packItemCollectionIdentifiers = packItemCollection.map(packItemItem => this.getPackItemIdentifier(packItemItem));
      const packItemsToAdd = packItems.filter(packItemItem => {
        const packItemIdentifier = this.getPackItemIdentifier(packItemItem);
        if (packItemCollectionIdentifiers.includes(packItemIdentifier)) {
          return false;
        }
        packItemCollectionIdentifiers.push(packItemIdentifier);
        return true;
      });
      return [...packItemsToAdd, ...packItemCollection];
    }
    return packItemCollection;
  }
}
