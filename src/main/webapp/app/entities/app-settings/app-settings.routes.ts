import { Routes } from '@angular/router';

import { ASC } from 'app/config/navigation.constants';
import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';

import AppSettingsResolve from './route/app-settings-routing-resolve.service';

const appSettingsRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/app-settings').then(m => m.AppSettings),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/app-settings-detail').then(m => m.AppSettingsDetail),
    resolve: {
      appSettings: AppSettingsResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/app-settings-update').then(m => m.AppSettingsUpdate),
    resolve: {
      appSettings: AppSettingsResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/app-settings-update').then(m => m.AppSettingsUpdate),
    resolve: {
      appSettings: AppSettingsResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default appSettingsRoute;
