import { HttpClient, HttpResponse, httpResource } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';

import dayjs from 'dayjs/esm';
import { Observable, map } from 'rxjs';

import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { isPresent } from 'app/core/util/operators';
import { IPaymentTransaction, NewPaymentTransaction } from '../payment-transaction.model';

export type PartialUpdatePaymentTransaction = Partial<IPaymentTransaction> & Pick<IPaymentTransaction, 'id'>;

type RestOf<T extends IPaymentTransaction | NewPaymentTransaction> = Omit<T, 'processedAt'> & {
  processedAt?: string | null;
};

export type RestPaymentTransaction = RestOf<IPaymentTransaction>;

export type NewRestPaymentTransaction = RestOf<NewPaymentTransaction>;

export type PartialUpdateRestPaymentTransaction = RestOf<PartialUpdatePaymentTransaction>;

@Injectable()
export class PaymentTransactionsService {
  readonly paymentTransactionsParams = signal<
    Record<string, string | number | boolean | readonly (string | number | boolean)[]> | undefined
  >(undefined);
  readonly paymentTransactionsResource = httpResource<RestPaymentTransaction[]>(() => {
    const params = this.paymentTransactionsParams();
    if (!params) {
      return undefined;
    }
    return { url: this.resourceUrl, params };
  });
  /**
   * This signal holds the list of paymentTransaction that have been fetched. It is updated when the paymentTransactionsResource emits a new value.
   * In case of error while fetching the paymentTransactions, the signal is set to an empty array.
   */
  readonly paymentTransactions = computed(() =>
    (this.paymentTransactionsResource.hasValue() ? this.paymentTransactionsResource.value() : []).map(item =>
      this.convertValueFromServer(item),
    ),
  );
  protected readonly applicationConfigService = inject(ApplicationConfigService);
  protected readonly resourceUrl = this.applicationConfigService.getEndpointFor('api/payment-transactions');

  protected convertValueFromServer(restPaymentTransaction: RestPaymentTransaction): IPaymentTransaction {
    return {
      ...restPaymentTransaction,
      processedAt: restPaymentTransaction.processedAt ? dayjs(restPaymentTransaction.processedAt) : undefined,
    };
  }
}

@Injectable({ providedIn: 'root' })
export class PaymentTransactionService extends PaymentTransactionsService {
  protected readonly http = inject(HttpClient);

  create(paymentTransaction: NewPaymentTransaction): Observable<IPaymentTransaction> {
    const copy = this.convertValueFromClient(paymentTransaction);
    return this.http.post<RestPaymentTransaction>(this.resourceUrl, copy).pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(paymentTransaction: IPaymentTransaction): Observable<IPaymentTransaction> {
    const copy = this.convertValueFromClient(paymentTransaction);
    return this.http
      .put<RestPaymentTransaction>(
        `${this.resourceUrl}/${encodeURIComponent(this.getPaymentTransactionIdentifier(paymentTransaction))}`,
        copy,
      )
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(paymentTransaction: PartialUpdatePaymentTransaction): Observable<IPaymentTransaction> {
    const copy = this.convertValueFromClient(paymentTransaction);
    return this.http
      .patch<RestPaymentTransaction>(
        `${this.resourceUrl}/${encodeURIComponent(this.getPaymentTransactionIdentifier(paymentTransaction))}`,
        copy,
      )
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<IPaymentTransaction> {
    return this.http
      .get<RestPaymentTransaction>(`${this.resourceUrl}/${encodeURIComponent(id)}`)
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<HttpResponse<IPaymentTransaction[]>> {
    const options = createRequestOption(req);
    return this.http
      .get<RestPaymentTransaction[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => res.clone({ body: this.convertResponseArrayFromServer(res.body!) })));
  }

  delete(id: number): Observable<undefined> {
    return this.http.delete<undefined>(`${this.resourceUrl}/${encodeURIComponent(id)}`);
  }

  getPaymentTransactionIdentifier(paymentTransaction: Pick<IPaymentTransaction, 'id'>): number {
    return paymentTransaction.id;
  }

  comparePaymentTransaction(o1: Pick<IPaymentTransaction, 'id'> | null, o2: Pick<IPaymentTransaction, 'id'> | null): boolean {
    return o1 && o2 ? this.getPaymentTransactionIdentifier(o1) === this.getPaymentTransactionIdentifier(o2) : o1 === o2;
  }

  addPaymentTransactionToCollectionIfMissing<Type extends Pick<IPaymentTransaction, 'id'>>(
    paymentTransactionCollection: Type[],
    ...paymentTransactionsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const paymentTransactions: Type[] = paymentTransactionsToCheck.filter(isPresent);
    if (paymentTransactions.length > 0) {
      const paymentTransactionCollectionIdentifiers = paymentTransactionCollection.map(paymentTransactionItem =>
        this.getPaymentTransactionIdentifier(paymentTransactionItem),
      );
      const paymentTransactionsToAdd = paymentTransactions.filter(paymentTransactionItem => {
        const paymentTransactionIdentifier = this.getPaymentTransactionIdentifier(paymentTransactionItem);
        if (paymentTransactionCollectionIdentifiers.includes(paymentTransactionIdentifier)) {
          return false;
        }
        paymentTransactionCollectionIdentifiers.push(paymentTransactionIdentifier);
        return true;
      });
      return [...paymentTransactionsToAdd, ...paymentTransactionCollection];
    }
    return paymentTransactionCollection;
  }

  protected convertValueFromClient<T extends IPaymentTransaction | NewPaymentTransaction | PartialUpdatePaymentTransaction>(
    paymentTransaction: T,
  ): RestOf<T> {
    return {
      ...paymentTransaction,
      processedAt: paymentTransaction.processedAt?.toJSON() ?? null,
    };
  }

  protected convertResponseFromServer(res: RestPaymentTransaction): IPaymentTransaction {
    return this.convertValueFromServer(res);
  }

  protected convertResponseArrayFromServer(res: RestPaymentTransaction[]): IPaymentTransaction[] {
    return res.map(item => this.convertValueFromServer(item));
  }
}
