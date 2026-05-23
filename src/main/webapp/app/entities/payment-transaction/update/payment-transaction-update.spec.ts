import { beforeEach, describe, expect, it, vitest } from 'vitest';
import { HttpResponse } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';
import { Subject, from, of } from 'rxjs';

import { IOrder } from 'app/entities/order/order.model';
import { OrderService } from 'app/entities/order/service/order.service';
import { IPaymentTransaction } from '../payment-transaction.model';
import { PaymentTransactionService } from '../service/payment-transaction.service';

import { PaymentTransactionFormService } from './payment-transaction-form.service';
import { PaymentTransactionUpdate } from './payment-transaction-update';

describe('PaymentTransaction Management Update Component', () => {
  let comp: PaymentTransactionUpdate;
  let fixture: ComponentFixture<PaymentTransactionUpdate>;
  let activatedRoute: ActivatedRoute;
  let paymentTransactionFormService: PaymentTransactionFormService;
  let paymentTransactionService: PaymentTransactionService;
  let orderService: OrderService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: {
            params: from([{}]),
          },
        },
      ],
    });

    fixture = TestBed.createComponent(PaymentTransactionUpdate);
    activatedRoute = TestBed.inject(ActivatedRoute);
    paymentTransactionFormService = TestBed.inject(PaymentTransactionFormService);
    paymentTransactionService = TestBed.inject(PaymentTransactionService);
    orderService = TestBed.inject(OrderService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should call Order query and add missing value', () => {
      const paymentTransaction: IPaymentTransaction = { id: 1571 };
      const order: IOrder = { id: 14644 };
      paymentTransaction.order = order;

      const orderCollection: IOrder[] = [{ id: 14644 }];
      vitest.spyOn(orderService, 'query').mockReturnValue(of(new HttpResponse({ body: orderCollection })));
      const additionalOrders = [order];
      const expectedCollection: IOrder[] = [...additionalOrders, ...orderCollection];
      vitest.spyOn(orderService, 'addOrderToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ paymentTransaction });
      comp.ngOnInit();

      expect(orderService.query).toHaveBeenCalled();
      expect(orderService.addOrderToCollectionIfMissing).toHaveBeenCalledWith(
        orderCollection,
        ...additionalOrders.map(i => expect.objectContaining(i) as typeof i),
      );
      expect(comp.ordersSharedCollection()).toEqual(expectedCollection);
    });

    it('should update editForm', () => {
      const paymentTransaction: IPaymentTransaction = { id: 1571 };
      const order: IOrder = { id: 14644 };
      paymentTransaction.order = order;

      activatedRoute.data = of({ paymentTransaction });
      comp.ngOnInit();

      expect(comp.ordersSharedCollection()).toContainEqual(order);
      expect(comp.paymentTransaction).toEqual(paymentTransaction);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<IPaymentTransaction>();
      const paymentTransaction = { id: 10661 };
      vitest.spyOn(paymentTransactionFormService, 'getPaymentTransaction').mockReturnValue(paymentTransaction);
      vitest.spyOn(paymentTransactionService, 'update').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ paymentTransaction });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.next(paymentTransaction);
      saveSubject.complete();

      // THEN
      expect(paymentTransactionFormService.getPaymentTransaction).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(paymentTransactionService.update).toHaveBeenCalledWith(expect.objectContaining(paymentTransaction));
      expect(comp.isSaving()).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<IPaymentTransaction>();
      const paymentTransaction = { id: 10661 };
      vitest.spyOn(paymentTransactionFormService, 'getPaymentTransaction').mockReturnValue({ id: null });
      vitest.spyOn(paymentTransactionService, 'create').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ paymentTransaction: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.next(paymentTransaction);
      saveSubject.complete();

      // THEN
      expect(paymentTransactionFormService.getPaymentTransaction).toHaveBeenCalled();
      expect(paymentTransactionService.create).toHaveBeenCalled();
      expect(comp.isSaving()).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<IPaymentTransaction>();
      const paymentTransaction = { id: 10661 };
      vitest.spyOn(paymentTransactionService, 'update').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ paymentTransaction });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(paymentTransactionService.update).toHaveBeenCalled();
      expect(comp.isSaving()).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });

  describe('Compare relationships', () => {
    describe('compareOrder', () => {
      it('should forward to orderService', () => {
        const entity = { id: 14644 };
        const entity2 = { id: 4253 };
        vitest.spyOn(orderService, 'compareOrder');
        comp.compareOrder(entity, entity2);
        expect(orderService.compareOrder).toHaveBeenCalledWith(entity, entity2);
      });
    });
  });
});
