import { Routes } from '@angular/router';

import { ASC } from 'app/config/navigation.constants';
import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';

import MediaResolve from './route/media-routing-resolve.service';

const mediaRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/media').then(m => m.Media),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/media-detail').then(m => m.MediaDetail),
    resolve: {
      media: MediaResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/media-update').then(m => m.MediaUpdate),
    resolve: {
      media: MediaResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/media-update').then(m => m.MediaUpdate),
    resolve: {
      media: MediaResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default mediaRoute;
