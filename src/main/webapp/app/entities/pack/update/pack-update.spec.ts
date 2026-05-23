import { beforeEach, describe, expect, it, vitest } from 'vitest';
import { HttpResponse } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';
import { Subject, from, of } from 'rxjs';

import { IMedia } from 'app/entities/media/media.model';
import { MediaService } from 'app/entities/media/service/media.service';
import { IPack } from '../pack.model';
import { PackService } from '../service/pack.service';

import { PackFormService } from './pack-form.service';
import { PackUpdate } from './pack-update';

describe('Pack Management Update Component', () => {
  let comp: PackUpdate;
  let fixture: ComponentFixture<PackUpdate>;
  let activatedRoute: ActivatedRoute;
  let packFormService: PackFormService;
  let packService: PackService;
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

    fixture = TestBed.createComponent(PackUpdate);
    activatedRoute = TestBed.inject(ActivatedRoute);
    packFormService = TestBed.inject(PackFormService);
    packService = TestBed.inject(PackService);
    mediaService = TestBed.inject(MediaService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should call mainMedia query and add missing value', () => {
      const pack: IPack = { id: 28997 };
      const mainMedia: IMedia = { id: 179 };
      pack.mainMedia = mainMedia;

      const mainMediaCollection: IMedia[] = [{ id: 179 }];
      vitest.spyOn(mediaService, 'query').mockReturnValue(of(new HttpResponse({ body: mainMediaCollection })));
      const expectedCollection: IMedia[] = [mainMedia, ...mainMediaCollection];
      vitest.spyOn(mediaService, 'addMediaToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ pack });
      comp.ngOnInit();

      expect(mediaService.query).toHaveBeenCalled();
      expect(mediaService.addMediaToCollectionIfMissing).toHaveBeenCalledWith(mainMediaCollection, mainMedia);
      expect(comp.mainMediasCollection()).toEqual(expectedCollection);
    });

    it('should update editForm', () => {
      const pack: IPack = { id: 28997 };
      const mainMedia: IMedia = { id: 179 };
      pack.mainMedia = mainMedia;

      activatedRoute.data = of({ pack });
      comp.ngOnInit();

      expect(comp.mainMediasCollection()).toContainEqual(mainMedia);
      expect(comp.pack).toEqual(pack);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<IPack>();
      const pack = { id: 22594 };
      vitest.spyOn(packFormService, 'getPack').mockReturnValue(pack);
      vitest.spyOn(packService, 'update').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ pack });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.next(pack);
      saveSubject.complete();

      // THEN
      expect(packFormService.getPack).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(packService.update).toHaveBeenCalledWith(expect.objectContaining(pack));
      expect(comp.isSaving()).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<IPack>();
      const pack = { id: 22594 };
      vitest.spyOn(packFormService, 'getPack').mockReturnValue({ id: null });
      vitest.spyOn(packService, 'create').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ pack: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.next(pack);
      saveSubject.complete();

      // THEN
      expect(packFormService.getPack).toHaveBeenCalled();
      expect(packService.create).toHaveBeenCalled();
      expect(comp.isSaving()).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<IPack>();
      const pack = { id: 22594 };
      vitest.spyOn(packService, 'update').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ pack });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(packService.update).toHaveBeenCalled();
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
