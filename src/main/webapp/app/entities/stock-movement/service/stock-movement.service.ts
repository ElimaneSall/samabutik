import { HttpClient, HttpResponse, httpResource } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';

import { Observable } from 'rxjs';

import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { isPresent } from 'app/core/util/operators';
import { IStockMovement, NewStockMovement } from '../stock-movement.model';

export type PartialUpdateStockMovement = Partial<IStockMovement> & Pick<IStockMovement, 'id'>;

@Injectable()
export class StockMovementsService {
  readonly stockMovementsParams = signal<Record<string, string | number | boolean | readonly (string | number | boolean)[]> | undefined>(
    undefined,
  );
  readonly stockMovementsResource = httpResource<IStockMovement[]>(() => {
    const params = this.stockMovementsParams();
    if (!params) {
      return undefined;
    }
    return { url: this.resourceUrl, params };
  });
  /**
   * This signal holds the list of stockMovement that have been fetched. It is updated when the stockMovementsResource emits a new value.
   * In case of error while fetching the stockMovements, the signal is set to an empty array.
   */
  readonly stockMovements = computed(() => (this.stockMovementsResource.hasValue() ? this.stockMovementsResource.value() : []));
  protected readonly applicationConfigService = inject(ApplicationConfigService);
  protected readonly resourceUrl = this.applicationConfigService.getEndpointFor('api/stock-movements');
}

@Injectable({ providedIn: 'root' })
export class StockMovementService extends StockMovementsService {
  protected readonly http = inject(HttpClient);

  create(stockMovement: NewStockMovement): Observable<IStockMovement> {
    return this.http.post<IStockMovement>(this.resourceUrl, stockMovement);
  }

  update(stockMovement: IStockMovement): Observable<IStockMovement> {
    return this.http.put<IStockMovement>(
      `${this.resourceUrl}/${encodeURIComponent(this.getStockMovementIdentifier(stockMovement))}`,
      stockMovement,
    );
  }

  partialUpdate(stockMovement: PartialUpdateStockMovement): Observable<IStockMovement> {
    return this.http.patch<IStockMovement>(
      `${this.resourceUrl}/${encodeURIComponent(this.getStockMovementIdentifier(stockMovement))}`,
      stockMovement,
    );
  }

  find(id: number): Observable<IStockMovement> {
    return this.http.get<IStockMovement>(`${this.resourceUrl}/${encodeURIComponent(id)}`);
  }

  query(req?: any): Observable<HttpResponse<IStockMovement[]>> {
    const options = createRequestOption(req);
    return this.http.get<IStockMovement[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<undefined> {
    return this.http.delete<undefined>(`${this.resourceUrl}/${encodeURIComponent(id)}`);
  }

  getStockMovementIdentifier(stockMovement: Pick<IStockMovement, 'id'>): number {
    return stockMovement.id;
  }

  compareStockMovement(o1: Pick<IStockMovement, 'id'> | null, o2: Pick<IStockMovement, 'id'> | null): boolean {
    return o1 && o2 ? this.getStockMovementIdentifier(o1) === this.getStockMovementIdentifier(o2) : o1 === o2;
  }

  addStockMovementToCollectionIfMissing<Type extends Pick<IStockMovement, 'id'>>(
    stockMovementCollection: Type[],
    ...stockMovementsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const stockMovements: Type[] = stockMovementsToCheck.filter(isPresent);
    if (stockMovements.length > 0) {
      const stockMovementCollectionIdentifiers = stockMovementCollection.map(stockMovementItem =>
        this.getStockMovementIdentifier(stockMovementItem),
      );
      const stockMovementsToAdd = stockMovements.filter(stockMovementItem => {
        const stockMovementIdentifier = this.getStockMovementIdentifier(stockMovementItem);
        if (stockMovementCollectionIdentifiers.includes(stockMovementIdentifier)) {
          return false;
        }
        stockMovementCollectionIdentifiers.push(stockMovementIdentifier);
        return true;
      });
      return [...stockMovementsToAdd, ...stockMovementCollection];
    }
    return stockMovementCollection;
  }
}
