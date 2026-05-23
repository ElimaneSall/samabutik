import { Routes } from '@angular/router';

import { ASC } from 'app/config/navigation.constants';
import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';

import UserStaffResolve from './route/user-staff-routing-resolve.service';

const userStaffRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/user-staff').then(m => m.UserStaff),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/user-staff-detail').then(m => m.UserStaffDetail),
    resolve: {
      userStaff: UserStaffResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/user-staff-update').then(m => m.UserStaffUpdate),
    resolve: {
      userStaff: UserStaffResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/user-staff-update').then(m => m.UserStaffUpdate),
    resolve: {
      userStaff: UserStaffResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default userStaffRoute;
