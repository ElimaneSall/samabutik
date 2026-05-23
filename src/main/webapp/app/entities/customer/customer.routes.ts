import { Routes } from '@angular/router';

import { ASC } from 'app/config/navigation.constants';
import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';

import CustomerResolve from './route/customer-routing-resolve.service';

const customerRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/customer').then(m => m.Customer),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/customer-detail').then(m => m.CustomerDetail),
    resolve: {
      customer: CustomerResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/customer-update').then(m => m.CustomerUpdate),
    resolve: {
      customer: CustomerResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/customer-update').then(m => m.CustomerUpdate),
    resolve: {
      customer: CustomerResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default customerRoute;
