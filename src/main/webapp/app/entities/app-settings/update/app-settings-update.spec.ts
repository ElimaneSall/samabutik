import { beforeEach, describe, expect, it, vitest } from 'vitest';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';
import { Subject, from, of } from 'rxjs';

import { IAppSettings } from '../app-settings.model';
import { AppSettingsService } from '../service/app-settings.service';

import { AppSettingsFormService } from './app-settings-form.service';
import { AppSettingsUpdate } from './app-settings-update';

describe('AppSettings Management Update Component', () => {
  let comp: AppSettingsUpdate;
  let fixture: ComponentFixture<AppSettingsUpdate>;
  let activatedRoute: ActivatedRoute;
  let appSettingsFormService: AppSettingsFormService;
  let appSettingsService: AppSettingsService;

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

    fixture = TestBed.createComponent(AppSettingsUpdate);
    activatedRoute = TestBed.inject(ActivatedRoute);
    appSettingsFormService = TestBed.inject(AppSettingsFormService);
    appSettingsService = TestBed.inject(AppSettingsService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should update editForm', () => {
      const appSettings: IAppSettings = { id: 32391 };

      activatedRoute.data = of({ appSettings });
      comp.ngOnInit();

      expect(comp.appSettings).toEqual(appSettings);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<IAppSettings>();
      const appSettings = { id: 31409 };
      vitest.spyOn(appSettingsFormService, 'getAppSettings').mockReturnValue(appSettings);
      vitest.spyOn(appSettingsService, 'update').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ appSettings });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.next(appSettings);
      saveSubject.complete();

      // THEN
      expect(appSettingsFormService.getAppSettings).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(appSettingsService.update).toHaveBeenCalledWith(expect.objectContaining(appSettings));
      expect(comp.isSaving()).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<IAppSettings>();
      const appSettings = { id: 31409 };
      vitest.spyOn(appSettingsFormService, 'getAppSettings').mockReturnValue({ id: null });
      vitest.spyOn(appSettingsService, 'create').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ appSettings: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.next(appSettings);
      saveSubject.complete();

      // THEN
      expect(appSettingsFormService.getAppSettings).toHaveBeenCalled();
      expect(appSettingsService.create).toHaveBeenCalled();
      expect(comp.isSaving()).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<IAppSettings>();
      const appSettings = { id: 31409 };
      vitest.spyOn(appSettingsService, 'update').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ appSettings });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(appSettingsService.update).toHaveBeenCalled();
      expect(comp.isSaving()).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });
});
