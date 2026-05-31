import { Routes } from '@angular/router';

import { ASC } from 'app/config/navigation.constants';
import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';

import OrderResolve from './route/order-routing-resolve.service';
import { orderCheckoutRoutes } from './route/order-checkout.routes';

const orderRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/order').then(m => m.Order),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/order-detail').then(m => m.OrderDetail),
    resolve: {
      order: OrderResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/order-update').then(m => m.OrderUpdate),
    resolve: {
      order: OrderResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/order-update').then(m => m.OrderUpdate),
    resolve: {
      order: OrderResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  ...orderCheckoutRoutes,
];

export default orderRoute;
