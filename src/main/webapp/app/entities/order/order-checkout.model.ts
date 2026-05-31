// src/app/features/order/models/order-checkout.model.ts
//
// // Ré-export des enums de votre JDL (à ajuster selon votre génération)
// export enum OrderStatus {
//   PENDING = 'PENDING',
//   PAID = 'PAID',
//   PREPARING = 'PREPARING',
//   SHIPPED = 'SHIPPED',
//   DELIVERED = 'DELIVERED',
//   CANCELLED = 'CANCELLED'
// }
//
// export enum PaymentStatus {
//   PENDING = 'PENDING',
//   SUCCESS = 'SUCCESS',
//   FAILED = 'FAILED',
//   REFUNDED = 'REFUNDED'
// }

import { OrderStatus } from '../enumerations/order-status.model';
import { PaymentStatus } from '../enumerations/payment-status.model';

export enum PaymentMethod {
  WAVE = 'WAVE',
  ORANGE_MONEY = 'ORANGE_MONEY',
  CASH = 'CASH',
}

export enum PaymentProvider {
  WAVE = 'WAVE',
  ORANGE_MONEY = 'ORANGE_MONEY',
  INTOUCH = 'INTOUCH',
}

// État du checkout (frontend only)
export enum CheckoutStep {
  SUMMARY = 1, // Récap OrderItems
  SHIPPING = 2, // Adresse livraison
  PAYMENT = 3, // Choix paiement
  VALIDATION = 4, // Confirmation/attente
}

// Interface pour afficher un OrderItem avec infos produit (snapshot)
export interface OrderItemDisplay {
  id: number;
  productName: string; // Depuis OrderItem.productName
  productSku: string; // Depuis OrderItem.productSku
  productImage?: string; // Jointure avec Product.mainMedia (optionnel)
  quantity: number; // OrderItem.quantity
  unitPrice: number; // OrderItem.unitPrice (prix figé au moment de la commande)
  subtotal: number; // OrderItem.subtotal
  isPackItem: boolean; // OrderItem.isPackItem
  stockAvailable?: number; // Info produit actuelle pour validation
}

// État local du checkout (ne remplace pas l'entité Order)
export interface CheckoutState {
  order: {
    id?: number;
    orderNumber?: string;
    status: OrderStatus;
    totalAmount: number;
    currency: string;
    shippingAddress: string;
    shippingCost: number;
    deliveryNote?: string;
    paymentMethod?: PaymentMethod;
    paymentStatus?: PaymentStatus;
    phoneNumber?: string; // Pour Wave/Orange Money
  };
  items: OrderItemDisplay[];
  currentStep: CheckoutStep;
  isLoading: boolean;
  error?: string;
}
