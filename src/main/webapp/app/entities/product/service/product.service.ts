import { HttpClient, HttpResponse, httpResource } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';

import { Observable } from 'rxjs';

import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { isPresent } from 'app/core/util/operators';
import { IProduct, NewProduct } from '../product.model';

export type PartialUpdateProduct = Partial<IProduct> & Pick<IProduct, 'id'>;

@Injectable()
export class ProductsService {
  readonly productsParams = signal<Record<string, string | number | boolean | readonly (string | number | boolean)[]> | undefined>(
    undefined,
  );
  readonly productsResource = httpResource<IProduct[]>(() => {
    const params = this.productsParams();
    if (!params) {
      return undefined;
    }
    return { url: this.resourceUrl, params };
  });
  /**
   * This signal holds the list of product that have been fetched. It is updated when the productsResource emits a new value.
   * In case of error while fetching the products, the signal is set to an empty array.
   */
  readonly products = computed(() => (this.productsResource.hasValue() ? this.productsResource.value() : []));
  protected readonly applicationConfigService = inject(ApplicationConfigService);
  protected readonly resourceUrl = this.applicationConfigService.getEndpointFor('api/products');
}

@Injectable({ providedIn: 'root' })
export class ProductService extends ProductsService {
  protected readonly http = inject(HttpClient);

  create(product: NewProduct): Observable<IProduct> {
    return this.http.post<IProduct>(this.resourceUrl, product);
  }

  update(product: IProduct): Observable<IProduct> {
    return this.http.put<IProduct>(`${this.resourceUrl}/${encodeURIComponent(this.getProductIdentifier(product))}`, product);
  }

  partialUpdate(product: PartialUpdateProduct): Observable<IProduct> {
    return this.http.patch<IProduct>(`${this.resourceUrl}/${encodeURIComponent(this.getProductIdentifier(product))}`, product);
  }

  find(id: number): Observable<IProduct> {
    return this.http.get<IProduct>(`${this.resourceUrl}/${encodeURIComponent(id)}`);
  }

  query(req?: any): Observable<HttpResponse<IProduct[]>> {
    const options = createRequestOption(req);
    return this.http.get<IProduct[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<undefined> {
    return this.http.delete<undefined>(`${this.resourceUrl}/${encodeURIComponent(id)}`);
  }

  getProductIdentifier(product: Pick<IProduct, 'id'>): number {
    return product.id;
  }

  compareProduct(o1: Pick<IProduct, 'id'> | null, o2: Pick<IProduct, 'id'> | null): boolean {
    return o1 && o2 ? this.getProductIdentifier(o1) === this.getProductIdentifier(o2) : o1 === o2;
  }

  addProductToCollectionIfMissing<Type extends Pick<IProduct, 'id'>>(
    productCollection: Type[],
    ...productsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const products: Type[] = productsToCheck.filter(isPresent);
    if (products.length > 0) {
      const productCollectionIdentifiers = productCollection.map(productItem => this.getProductIdentifier(productItem));
      const productsToAdd = products.filter(productItem => {
        const productIdentifier = this.getProductIdentifier(productItem);
        if (productCollectionIdentifiers.includes(productIdentifier)) {
          return false;
        }
        productCollectionIdentifiers.push(productIdentifier);
        return true;
      });
      return [...productsToAdd, ...productCollection];
    }
    return productCollection;
  }
}
