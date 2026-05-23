import { HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';

import { EMPTY, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { IProduct } from '../product.model';
import { ProductService } from '../service/product.service';

const productResolve = (route: ActivatedRouteSnapshot): Observable<null | IProduct> => {
  const id = route.params.id;
  if (id) {
    const router = inject(Router);
    const service = inject(ProductService);
    return service.find(id).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 404) {
          router.navigate(['404']);
        } else {
          router.navigate(['error']);
        }
        return EMPTY;
      }),
    );
  }

  return of(null);
};

export default productResolve;
