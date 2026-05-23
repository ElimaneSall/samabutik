import { beforeEach, describe, expect, it, vitest } from 'vitest';
import { HttpResponse } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';
import { Subject, from, of } from 'rxjs';

import { IMedia } from 'app/entities/media/media.model';
import { MediaService } from 'app/entities/media/service/media.service';
import { IProduct } from '../product.model';
import { ProductService } from '../service/product.service';

import { ProductFormService } from './product-form.service';
import { ProductUpdate } from './product-update';

describe('Product Management Update Component', () => {
  let comp: ProductUpdate;
  let fixture: ComponentFixture<ProductUpdate>;
  let activatedRoute: ActivatedRoute;
  let productFormService: ProductFormService;
  let productService: ProductService;
  let mediaService: MediaService;

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

    fixture = TestBed.createComponent(ProductUpdate);
    activatedRoute = TestBed.inject(ActivatedRoute);
    productFormService = TestBed.inject(ProductFormService);
    productService = TestBed.inject(ProductService);
    mediaService = TestBed.inject(MediaService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should call mainMedia query and add missing value', () => {
      const product: IProduct = { id: 11926 };
      const mainMedia: IMedia = { id: 179 };
      product.mainMedia = mainMedia;

      const mainMediaCollection: IMedia[] = [{ id: 179 }];
      vitest.spyOn(mediaService, 'query').mockReturnValue(of(new HttpResponse({ body: mainMediaCollection })));
      const expectedCollection: IMedia[] = [mainMedia, ...mainMediaCollection];
      vitest.spyOn(mediaService, 'addMediaToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ product });
      comp.ngOnInit();

      expect(mediaService.query).toHaveBeenCalled();
      expect(mediaService.addMediaToCollectionIfMissing).toHaveBeenCalledWith(mainMediaCollection, mainMedia);
      expect(comp.mainMediasCollection()).toEqual(expectedCollection);
    });

    it('should update editForm', () => {
      const product: IProduct = { id: 11926 };
      const mainMedia: IMedia = { id: 179 };
      product.mainMedia = mainMedia;

      activatedRoute.data = of({ product });
      comp.ngOnInit();

      expect(comp.mainMediasCollection()).toContainEqual(mainMedia);
      expect(comp.product).toEqual(product);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<IProduct>();
      const product = { id: 21536 };
      vitest.spyOn(productFormService, 'getProduct').mockReturnValue(product);
      vitest.spyOn(productService, 'update').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ product });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.next(product);
      saveSubject.complete();

      // THEN
      expect(productFormService.getProduct).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(productService.update).toHaveBeenCalledWith(expect.objectContaining(product));
      expect(comp.isSaving()).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<IProduct>();
      const product = { id: 21536 };
      vitest.spyOn(productFormService, 'getProduct').mockReturnValue({ id: null });
      vitest.spyOn(productService, 'create').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ product: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.next(product);
      saveSubject.complete();

      // THEN
      expect(productFormService.getProduct).toHaveBeenCalled();
      expect(productService.create).toHaveBeenCalled();
      expect(comp.isSaving()).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<IProduct>();
      const product = { id: 21536 };
      vitest.spyOn(productService, 'update').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ product });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(productService.update).toHaveBeenCalled();
      expect(comp.isSaving()).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });

  describe('Compare relationships', () => {
    describe('compareMedia', () => {
      it('should forward to mediaService', () => {
        const entity = { id: 179 };
        const entity2 = { id: 26043 };
        vitest.spyOn(mediaService, 'compareMedia');
        comp.compareMedia(entity, entity2);
        expect(mediaService.compareMedia).toHaveBeenCalledWith(entity, entity2);
      });
    });
  });
});
