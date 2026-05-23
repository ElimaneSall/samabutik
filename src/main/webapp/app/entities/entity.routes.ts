import { Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'authority',
    data: { pageTitle: 'samabutikApp.adminAuthority.home.title' },
    loadChildren: () => import('./admin/authority/authority.routes'),
  },
  {
    path: 'user-management',
    data: { pageTitle: 'userManagement.home.title' },
    loadChildren: () => import('./admin/user-management/user-management.routes'),
  },
  {
    path: 'customer',
    data: { pageTitle: 'samabutikApp.customer.home.title' },
    loadChildren: () => import('./customer/customer.routes'),
  },
  {
    path: 'product',
    data: { pageTitle: 'samabutikApp.product.home.title' },
    loadChildren: () => import('./product/product.routes'),
  },
  {
    path: 'pack',
    data: { pageTitle: 'samabutikApp.pack.home.title' },
    loadChildren: () => import('./pack/pack.routes'),
  },
  {
    path: 'pack-item',
    data: { pageTitle: 'samabutikApp.packItem.home.title' },
    loadChildren: () => import('./pack-item/pack-item.routes'),
  },
  {
    path: 'order',
    data: { pageTitle: 'samabutikApp.order.home.title' },
    loadChildren: () => import('./order/order.routes'),
  },
  {
    path: 'order-item',
    data: { pageTitle: 'samabutikApp.orderItem.home.title' },
    loadChildren: () => import('./order-item/order-item.routes'),
  },
  {
    path: 'media',
    data: { pageTitle: 'samabutikApp.media.home.title' },
    loadChildren: () => import('./media/media.routes'),
  },
  {
    path: 'payment-transaction',
    data: { pageTitle: 'samabutikApp.paymentTransaction.home.title' },
    loadChildren: () => import('./payment-transaction/payment-transaction.routes'),
  },
  {
    path: 'user-staff',
    data: { pageTitle: 'samabutikApp.userStaff.home.title' },
    loadChildren: () => import('./user-staff/user-staff.routes'),
  },
  {
    path: 'stock-movement',
    data: { pageTitle: 'samabutikApp.stockMovement.home.title' },
    loadChildren: () => import('./stock-movement/stock-movement.routes'),
  },
  {
    path: 'app-settings',
    data: { pageTitle: 'samabutikApp.appSettings.home.title' },
    loadChildren: () => import('./app-settings/app-settings.routes'),
  },
  /* jhipster-needle-add-entity-route - JHipster will add entity modules routes here */
];

export default routes;
