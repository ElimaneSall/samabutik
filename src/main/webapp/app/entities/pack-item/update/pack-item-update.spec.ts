import { beforeEach, describe, expect, it, vitest } from 'vitest';
import { HttpResponse } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';
import { Subject, from, of } from 'rxjs';

import { IPack } from 'app/entities/pack/pack.model';
import { PackService } from 'app/entities/pack/service/pack.service';
import { IProduct } from 'app/entities/product/product.model';
import { ProductService } from 'app/entities/product/service/product.service';
import { IPackItem } from '../pack-item.model';
import { PackItemService } from '../service/pack-item.service';

import { PackItemFormService } from './pack-item-form.service';
import { PackItemUpdate } from './pack-item-update';

describe('PackItem Management Update Component', () => {
  let comp: PackItemUpdate;
  let fixture: ComponentFixture<PackItemUpdate>;
  let activatedRoute: ActivatedRoute;
  let packItemFormService: PackItemFormService;
  let packItemService: PackItemService;
  let packService: PackService;
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

    fixture = TestBed.createComponent(PackItemUpdate);
    activatedRoute = TestBed.inject(ActivatedRoute);
    packItemFormService = TestBed.inject(PackItemFormService);
    packItemService = TestBed.inject(PackItemService);
    packService = TestBed.inject(PackService);
    productService = TestBed.inject(ProductService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should call Pack query and add missing value', () => {
      const packItem: IPackItem = { id: 2459 };
      const pack: IPack = { id: 22594 };
      packItem.pack = pack;

      const packCollection: IPack[] = [{ id: 22594 }];
      vitest.spyOn(packService, 'query').mockReturnValue(of(new HttpResponse({ body: packCollection })));
      const additionalPacks = [pack];
      const expectedCollection: IPack[] = [...additionalPacks, ...packCollection];
      vitest.spyOn(packService, 'addPackToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ packItem });
      comp.ngOnInit();

      expect(packService.query).toHaveBeenCalled();
      expect(packService.addPackToCollectionIfMissing).toHaveBeenCalledWith(
        packCollection,
        ...additionalPacks.map(i => expect.objectContaining(i) as typeof i),
      );
      expect(comp.packsSharedCollection()).toEqual(expectedCollection);
    });

    it('should call Product query and add missing value', () => {
      const packItem: IPackItem = { id: 2459 };
      const product: IProduct = { id: 21536 };
      packItem.product = product;

      const productCollection: IProduct[] = [{ id: 21536 }];
      vitest.spyOn(productService, 'query').mockReturnValue(of(new HttpResponse({ body: productCollection })));
      const additionalProducts = [product];
      const expectedCollection: IProduct[] = [...additionalProducts, ...productCollection];
      vitest.spyOn(productService, 'addProductToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ packItem });
      comp.ngOnInit();

      expect(productService.query).toHaveBeenCalled();
      expect(productService.addProductToCollectionIfMissing).toHaveBeenCalledWith(
        productCollection,
        ...additionalProducts.map(i => expect.objectContaining(i) as typeof i),
      );
      expect(comp.productsSharedCollection()).toEqual(expectedCollection);
    });

    it('should update editForm', () => {
      const packItem: IPackItem = { id: 2459 };
      const pack: IPack = { id: 22594 };
      packItem.pack = pack;
      const product: IProduct = { id: 21536 };
      packItem.product = product;

      activatedRoute.data = of({ packItem });
      comp.ngOnInit();

      expect(comp.packsSharedCollection()).toContainEqual(pack);
      expect(comp.productsSharedCollection()).toContainEqual(product);
      expect(comp.packItem).toEqual(packItem);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<IPackItem>();
      const packItem = { id: 4307 };
      vitest.spyOn(packItemFormService, 'getPackItem').mockReturnValue(packItem);
      vitest.spyOn(packItemService, 'update').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ packItem });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.next(packItem);
      saveSubject.complete();

      // THEN
      expect(packItemFormService.getPackItem).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(packItemService.update).toHaveBeenCalledWith(expect.objectContaining(packItem));
      expect(comp.isSaving()).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<IPackItem>();
      const packItem = { id: 4307 };
      vitest.spyOn(packItemFormService, 'getPackItem').mockReturnValue({ id: null });
      vitest.spyOn(packItemService, 'create').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ packItem: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.next(packItem);
      saveSubject.complete();

      // THEN
      expect(packItemFormService.getPackItem).toHaveBeenCalled();
      expect(packItemService.create).toHaveBeenCalled();
      expect(comp.isSaving()).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<IPackItem>();
      const packItem = { id: 4307 };
      vitest.spyOn(packItemService, 'update').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ packItem });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(packItemService.update).toHaveBeenCalled();
      expect(comp.isSaving()).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });

  describe('Compare relationships', () => {
    describe('comparePack', () => {
      it('should forward to packService', () => {
        const entity = { id: 22594 };
        const entity2 = { id: 28997 };
        vitest.spyOn(packService, 'comparePack');
        comp.comparePack(entity, entity2);
        expect(packService.comparePack).toHaveBeenCalledWith(entity, entity2);
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
