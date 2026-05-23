import { Routes } from '@angular/router';

import { ASC } from 'app/config/navigation.constants';
import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';

import StockMovementResolve from './route/stock-movement-routing-resolve.service';

const stockMovementRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/stock-movement').then(m => m.StockMovement),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/stock-movement-detail').then(m => m.StockMovementDetail),
    resolve: {
      stockMovement: StockMovementResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/stock-movement-update').then(m => m.StockMovementUpdate),
    resolve: {
      stockMovement: StockMovementResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/stock-movement-update').then(m => m.StockMovementUpdate),
    resolve: {
      stockMovement: StockMovementResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default stockMovementRoute;
