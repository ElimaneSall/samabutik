import { Routes } from '@angular/router';
import { OrderSummary } from '../components/order-summary/order-summary';
import { OrderCheckout } from '../components/order-checkout/order-checkout';
import { OrderTracking } from '../components/order-tracking/order-tracking';
import { OrderValidation } from '../components/order-validation/order-validation';

export const orderCheckoutRoutes: Routes = [
  {
    path: 'summary',
    component: OrderSummary,
    title: 'Récapitulatif commande',
  },
  {
    path: 'checkout',
    component: OrderCheckout,
    title: 'Finaliser la commande',
  },
  {
    path: 'payment-validation',
    component: OrderValidation,
    title: 'Validation paiement',
  },
  {
    path: 'tracking/:orderId',
    component: OrderTracking,
    title: 'Suivi de commande',
  },
];
