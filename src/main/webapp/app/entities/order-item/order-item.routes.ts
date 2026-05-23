import { Routes } from '@angular/router';

import { ASC } from 'app/config/navigation.constants';
import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';

import OrderItemResolve from './route/order-item-routing-resolve.service';

const orderItemRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/order-item').then(m => m.OrderItem),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/order-item-detail').then(m => m.OrderItemDetail),
    resolve: {
      orderItem: OrderItemResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/order-item-update').then(m => m.OrderItemUpdate),
    resolve: {
      orderItem: OrderItemResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/order-item-update').then(m => m.OrderItemUpdate),
    resolve: {
      orderItem: OrderItemResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default orderItemRoute;
