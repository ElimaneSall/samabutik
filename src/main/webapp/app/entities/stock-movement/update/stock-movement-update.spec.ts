import { beforeEach, describe, expect, it, vitest } from 'vitest';
import { HttpResponse } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';
import { Subject, from, of } from 'rxjs';

import { IProduct } from 'app/entities/product/product.model';
import { ProductService } from 'app/entities/product/service/product.service';
import { UserStaffService } from 'app/entities/user-staff/service/user-staff.service';
import { IUserStaff } from 'app/entities/user-staff/user-staff.model';
import { StockMovementService } from '../service/stock-movement.service';
import { IStockMovement } from '../stock-movement.model';

import { StockMovementFormService } from './stock-movement-form.service';
import { StockMovementUpdate } from './stock-movement-update';

describe('StockMovement Management Update Component', () => {
  let comp: StockMovementUpdate;
  let fixture: ComponentFixture<StockMovementUpdate>;
  let activatedRoute: ActivatedRoute;
  let stockMovementFormService: StockMovementFormService;
  let stockMovementService: StockMovementService;
  let userStaffService: UserStaffService;
  let productService: ProductService;

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

    fixture = TestBed.createComponent(StockMovementUpdate);
    activatedRoute = TestBed.inject(ActivatedRoute);
    stockMovementFormService = TestBed.inject(StockMovementFormService);
    stockMovementService = TestBed.inject(StockMovementService);
    userStaffService = TestBed.inject(UserStaffService);
    productService = TestBed.inject(ProductService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should call performedBy query and add missing value', () => {
      const stockMovement: IStockMovement = { id: 1833 };
      const performedBy: IUserStaff = { id: 5345 };
      stockMovement.performedBy = performedBy;

      const performedByCollection: IUserStaff[] = [{ id: 5345 }];
      vitest.spyOn(userStaffService, 'query').mockReturnValue(of(new HttpResponse({ body: performedByCollection })));
      const expectedCollection: IUserStaff[] = [performedBy, ...performedByCollection];
      vitest.spyOn(userStaffService, 'addUserStaffToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ stockMovement });
      comp.ngOnInit();

      expect(userStaffService.query).toHaveBeenCalled();
      expect(userStaffService.addUserStaffToCollectionIfMissing).toHaveBeenCalledWith(performedByCollection, performedBy);
      expect(comp.performedBiesCollection()).toEqual(expectedCollection);
    });

    it('should call Product query and add missing value', () => {
      const stockMovement: IStockMovement = { id: 1833 };
      const product: IProduct = { id: 21536 };
      stockMovement.product = product;

      const productCollection: IProduct[] = [{ id: 21536 }];
      vitest.spyOn(productService, 'query').mockReturnValue(of(new HttpResponse({ body: productCollection })));
      const additionalProducts = [product];
      const expectedCollection: IProduct[] = [...additionalProducts, ...productCollection];
      vitest.spyOn(productService, 'addProductToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ stockMovement });
      comp.ngOnInit();

      expect(productService.query).toHaveBeenCalled();
      expect(productService.addProductToCollectionIfMissing).toHaveBeenCalledWith(
        productCollection,
        ...additionalProducts.map(i => expect.objectContaining(i) as typeof i),
      );
      expect(comp.productsSharedCollection()).toEqual(expectedCollection);
    });

    it('should update editForm', () => {
      const stockMovement: IStockMovement = { id: 1833 };
      const performedBy: IUserStaff = { id: 5345 };
      stockMovement.performedBy = performedBy;
      const product: IProduct = { id: 21536 };
      stockMovement.product = product;

      activatedRoute.data = of({ stockMovement });
      comp.ngOnInit();

      expect(comp.performedBiesCollection()).toContainEqual(performedBy);
      expect(comp.productsSharedCollection()).toContainEqual(product);
      expect(comp.stockMovement).toEqual(stockMovement);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<IStockMovement>();
      const stockMovement = { id: 18917 };
      vitest.spyOn(stockMovementFormService, 'getStockMovement').mockReturnValue(stockMovement);
      vitest.spyOn(stockMovementService, 'update').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ stockMovement });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.next(stockMovement);
      saveSubject.complete();

      // THEN
      expect(stockMovementFormService.getStockMovement).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(stockMovementService.update).toHaveBeenCalledWith(expect.objectContaining(stockMovement));
      expect(comp.isSaving()).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<IStockMovement>();
      const stockMovement = { id: 18917 };
      vitest.spyOn(stockMovementFormService, 'getStockMovement').mockReturnValue({ id: null });
      vitest.spyOn(stockMovementService, 'create').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ stockMovement: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.next(stockMovement);
      saveSubject.complete();

      // THEN
      expect(stockMovementFormService.getStockMovement).toHaveBeenCalled();
      expect(stockMovementService.create).toHaveBeenCalled();
      expect(comp.isSaving()).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<IStockMovement>();
      const stockMovement = { id: 18917 };
      vitest.spyOn(stockMovementService, 'update').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ stockMovement });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(stockMovementService.update).toHaveBeenCalled();
      expect(comp.isSaving()).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });

  describe('Compare relationships', () => {
    describe('compareUserStaff', () => {
      it('should forward to userStaffService', () => {
        const entity = { id: 5345 };
        const entity2 = { id: 20159 };
        vitest.spyOn(userStaffService, 'compareUserStaff');
        comp.compareUserStaff(entity, entity2);
        expect(userStaffService.compareUserStaff).toHaveBeenCalledWith(entity, entity2);
      });
    });

    describe('compareProduct', () => {
      it('should forward to productService', () => {
        const entity = { id: 21536 };
        const entity2 = { id: 11926 };
        vitest.spyOn(productService, 'compareProduct');
        comp.compareProduct(entity, entity2);
        expect(productService.compareProduct).toHaveBeenCalledWith(entity, entity2);
      });
    });
  });
});
