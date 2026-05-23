import { HttpClient, HttpResponse, httpResource } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';

import { Observable } from 'rxjs';

import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { isPresent } from 'app/core/util/operators';
import { ICustomer, NewCustomer } from '../customer.model';

export type PartialUpdateCustomer = Partial<ICustomer> & Pick<ICustomer, 'id'>;

@Injectable()
export class CustomersService {
  readonly customersParams = signal<Record<string, string | number | boolean | readonly (string | number | boolean)[]> | undefined>(
    undefined,
  );
  readonly customersResource = httpResource<ICustomer[]>(() => {
    const params = this.customersParams();
    if (!params) {
      return undefined;
    }
    return { url: this.resourceUrl, params };
  });
  /**
   * This signal holds the list of customer that have been fetched. It is updated when the customersResource emits a new value.
   * In case of error while fetching the customers, the signal is set to an empty array.
   */
  readonly customers = computed(() => (this.customersResource.hasValue() ? this.customersResource.value() : []));
  protected readonly applicationConfigService = inject(ApplicationConfigService);
  protected readonly resourceUrl = this.applicationConfigService.getEndpointFor('api/customers');
}

@Injectable({ providedIn: 'root' })
export class CustomerService extends CustomersService {
  protected readonly http = inject(HttpClient);

  create(customer: NewCustomer): Observable<ICustomer> {
    return this.http.post<ICustomer>(this.resourceUrl, customer);
  }

  update(customer: ICustomer): Observable<ICustomer> {
    return this.http.put<ICustomer>(`${this.resourceUrl}/${encodeURIComponent(this.getCustomerIdentifier(customer))}`, customer);
  }

  partialUpdate(customer: PartialUpdateCustomer): Observable<ICustomer> {
    return this.http.patch<ICustomer>(`${this.resourceUrl}/${encodeURIComponent(this.getCustomerIdentifier(customer))}`, customer);
  }

  find(id: number): Observable<ICustomer> {
    return this.http.get<ICustomer>(`${this.resourceUrl}/${encodeURIComponent(id)}`);
  }

  query(req?: any): Observable<HttpResponse<ICustomer[]>> {
    const options = createRequestOption(req);
    return this.http.get<ICustomer[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<undefined> {
    return this.http.delete<undefined>(`${this.resourceUrl}/${encodeURIComponent(id)}`);
  }

  getCustomerIdentifier(customer: Pick<ICustomer, 'id'>): number {
    return customer.id;
  }

  compareCustomer(o1: Pick<ICustomer, 'id'> | null, o2: Pick<ICustomer, 'id'> | null): boolean {
    return o1 && o2 ? this.getCustomerIdentifier(o1) === this.getCustomerIdentifier(o2) : o1 === o2;
  }

  addCustomerToCollectionIfMissing<Type extends Pick<ICustomer, 'id'>>(
    customerCollection: Type[],
    ...customersToCheck: (Type | null | undefined)[]
  ): Type[] {
    const customers: Type[] = customersToCheck.filter(isPresent);
    if (customers.length > 0) {
      const customerCollectionIdentifiers = customerCollection.map(customerItem => this.getCustomerIdentifier(customerItem));
      const customersToAdd = customers.filter(customerItem => {
        const customerIdentifier = this.getCustomerIdentifier(customerItem);
        if (customerCollectionIdentifiers.includes(customerIdentifier)) {
          return false;
        }
        customerCollectionIdentifiers.push(customerIdentifier);
        return true;
      });
      return [...customersToAdd, ...customerCollection];
    }
    return customerCollection;
  }
}
