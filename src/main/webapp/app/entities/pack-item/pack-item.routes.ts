import { Routes } from '@angular/router';

import { ASC } from 'app/config/navigation.constants';
import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';

import PackItemResolve from './route/pack-item-routing-resolve.service';

const packItemRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/pack-item').then(m => m.PackItem),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/pack-item-detail').then(m => m.PackItemDetail),
    resolve: {
      packItem: PackItemResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/pack-item-update').then(m => m.PackItemUpdate),
    resolve: {
      packItem: PackItemResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/pack-item-update').then(m => m.PackItemUpdate),
    resolve: {
      packItem: PackItemResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default packItemRoute;
