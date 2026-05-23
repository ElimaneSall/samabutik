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
import { IMedia } from '../media.model';
import { MediaService } from '../service/media.service';

import { MediaFormService } from './media-form.service';
import { MediaUpdate } from './media-update';

describe('Media Management Update Component', () => {
  let comp: MediaUpdate;
  let fixture: ComponentFixture<MediaUpdate>;
  let activatedRoute: ActivatedRoute;
  let mediaFormService: MediaFormService;
  let mediaService: MediaService;
  let productService: ProductService;
  let packService: PackService;

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

    fixture = TestBed.createComponent(MediaUpdate);
    activatedRoute = TestBed.inject(ActivatedRoute);
    mediaFormService = TestBed.inject(MediaFormService);
    mediaService = TestBed.inject(MediaService);
    productService = TestBed.inject(ProductService);
    packService = TestBed.inject(PackService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should call Product query and add missing value', () => {
      const media: IMedia = { id: 26043 };
      const productGallery: IProduct = { id: 21536 };
      media.productGallery = productGallery;

      const productCollection: IProduct[] = [{ id: 21536 }];
      vitest.spyOn(productService, 'query').mockReturnValue(of(new HttpResponse({ body: productCollection })));
      const additionalProducts = [productGallery];
      const expectedCollection: IProduct[] = [...additionalProducts, ...productCollection];
      vitest.spyOn(productService, 'addProductToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ media });
      comp.ngOnInit();

      expect(productService.query).toHaveBeenCalled();
      expect(productService.addProductToCollectionIfMissing).toHaveBeenCalledWith(
        productCollection,
        ...additionalProducts.map(i => expect.objectContaining(i) as typeof i),
      );
      expect(comp.productsSharedCollection()).toEqual(expectedCollection);
    });

    it('should call Pack query and add missing value', () => {
      const media: IMedia = { id: 26043 };
      const packGallery: IPack = { id: 22594 };
      media.packGallery = packGallery;

      const packCollection: IPack[] = [{ id: 22594 }];
      vitest.spyOn(packService, 'query').mockReturnValue(of(new HttpResponse({ body: packCollection })));
      const additionalPacks = [packGallery];
      const expectedCollection: IPack[] = [...additionalPacks, ...packCollection];
      vitest.spyOn(packService, 'addPackToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ media });
      comp.ngOnInit();

      expect(packService.query).toHaveBeenCalled();
      expect(packService.addPackToCollectionIfMissing).toHaveBeenCalledWith(
        packCollection,
        ...additionalPacks.map(i => expect.objectContaining(i) as typeof i),
      );
      expect(comp.packsSharedCollection()).toEqual(expectedCollection);
    });

    it('should update editForm', () => {
      const media: IMedia = { id: 26043 };
      const productGallery: IProduct = { id: 21536 };
      media.productGallery = productGallery;
      const packGallery: IPack = { id: 22594 };
      media.packGallery = packGallery;

      activatedRoute.data = of({ media });
      comp.ngOnInit();

      expect(comp.productsSharedCollection()).toContainEqual(productGallery);
      expect(comp.packsSharedCollection()).toContainEqual(packGallery);
      expect(comp.media).toEqual(media);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<IMedia>();
      const media = { id: 179 };
      vitest.spyOn(mediaFormService, 'getMedia').mockReturnValue(media);
      vitest.spyOn(mediaService, 'update').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ media });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.next(media);
      saveSubject.complete();

      // THEN
      expect(mediaFormService.getMedia).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(mediaService.update).toHaveBeenCalledWith(expect.objectContaining(media));
      expect(comp.isSaving()).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<IMedia>();
      const media = { id: 179 };
      vitest.spyOn(mediaFormService, 'getMedia').mockReturnValue({ id: null });
      vitest.spyOn(mediaService, 'create').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ media: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.next(media);
      saveSubject.complete();

      // THEN
      expect(mediaFormService.getMedia).toHaveBeenCalled();
      expect(mediaService.create).toHaveBeenCalled();
      expect(comp.isSaving()).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<IMedia>();
      const media = { id: 179 };
      vitest.spyOn(mediaService, 'update').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ media });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(mediaService.update).toHaveBeenCalled();
      expect(comp.isSaving()).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });

  describe('Compare relationships', () => {
    describe('compareProduct', () => {
      it('should forward to productService', () => {
        const entity = { id: 21536 };
        const entity2 = { id: 11926 };
        vitest.spyOn(productService, 'compareProduct');
        comp.compareProduct(entity, entity2);
        expect(productService.compareProduct).toHaveBeenCalledWith(entity, entity2);
      });
    });

    describe('comparePack', () => {
      it('should forward to packService', () => {
        const entity = { id: 22594 };
        const entity2 = { id: 28997 };
        vitest.spyOn(packService, 'comparePack');
        comp.comparePack(entity, entity2);
        expect(packService.comparePack).toHaveBeenCalledWith(entity, entity2);
      });
    });
  });
});
