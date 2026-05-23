import { Routes } from '@angular/router';

import { ASC } from 'app/config/navigation.constants';
import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';

import PackResolve from './route/pack-routing-resolve.service';

const packRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/pack').then(m => m.Pack),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/pack-detail').then(m => m.PackDetail),
    resolve: {
      pack: PackResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/pack-update').then(m => m.PackUpdate),
    resolve: {
      pack: PackResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/pack-update').then(m => m.PackUpdate),
    resolve: {
      pack: PackResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default packRoute;
