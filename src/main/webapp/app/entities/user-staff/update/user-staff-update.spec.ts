import { beforeEach, describe, expect, it, vitest } from 'vitest';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';
import { Subject, from, of } from 'rxjs';

import { UserStaffService } from '../service/user-staff.service';
import { IUserStaff } from '../user-staff.model';

import { UserStaffFormService } from './user-staff-form.service';
import { UserStaffUpdate } from './user-staff-update';

describe('UserStaff Management Update Component', () => {
  let comp: UserStaffUpdate;
  let fixture: ComponentFixture<UserStaffUpdate>;
  let activatedRoute: ActivatedRoute;
  let userStaffFormService: UserStaffFormService;
  let userStaffService: UserStaffService;

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

    fixture = TestBed.createComponent(UserStaffUpdate);
    activatedRoute = TestBed.inject(ActivatedRoute);
    userStaffFormService = TestBed.inject(UserStaffFormService);
    userStaffService = TestBed.inject(UserStaffService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should update editForm', () => {
      const userStaff: IUserStaff = { id: 20159 };

      activatedRoute.data = of({ userStaff });
      comp.ngOnInit();

      expect(comp.userStaff).toEqual(userStaff);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<IUserStaff>();
      const userStaff = { id: 5345 };
      vitest.spyOn(userStaffFormService, 'getUserStaff').mockReturnValue(userStaff);
      vitest.spyOn(userStaffService, 'update').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ userStaff });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.next(userStaff);
      saveSubject.complete();

      // THEN
      expect(userStaffFormService.getUserStaff).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(userStaffService.update).toHaveBeenCalledWith(expect.objectContaining(userStaff));
      expect(comp.isSaving()).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<IUserStaff>();
      const userStaff = { id: 5345 };
      vitest.spyOn(userStaffFormService, 'getUserStaff').mockReturnValue({ id: null });
      vitest.spyOn(userStaffService, 'create').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ userStaff: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.next(userStaff);
      saveSubject.complete();

      // THEN
      expect(userStaffFormService.getUserStaff).toHaveBeenCalled();
      expect(userStaffService.create).toHaveBeenCalled();
      expect(comp.isSaving()).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<IUserStaff>();
      const userStaff = { id: 5345 };
      vitest.spyOn(userStaffService, 'update').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ userStaff });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(userStaffService.update).toHaveBeenCalled();
      expect(comp.isSaving()).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });
});
