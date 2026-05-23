import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { UserRole } from 'app/entities/enumerations/user-role.model';
import { AlertError } from 'app/shared/alert/alert-error';
import { TranslateDirective } from 'app/shared/language';
import { UserStaffService } from '../service/user-staff.service';
import { IUserStaff } from '../user-staff.model';

import { UserStaffFormGroup, UserStaffFormService } from './user-staff-form.service';

@Component({
  selector: 'jhi-user-staff-update',
  templateUrl: './user-staff-update.html',
  imports: [TranslateDirective, TranslateModule, FontAwesomeModule, AlertError, ReactiveFormsModule],
})
export class UserStaffUpdate implements OnInit {
  readonly isSaving = signal(false);
  userStaff: IUserStaff | null = null;
  userRoleValues = Object.keys(UserRole);

  protected userStaffService = inject(UserStaffService);
  protected userStaffFormService = inject(UserStaffFormService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: UserStaffFormGroup = this.userStaffFormService.createUserStaffFormGroup();

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ userStaff }) => {
      this.userStaff = userStaff;
      if (userStaff) {
        this.updateForm(userStaff);
      }
    });
  }

  previousState(): void {
    globalThis.history.back();
  }

  save(): void {
    this.isSaving.set(true);
    const userStaff = this.userStaffFormService.getUserStaff(this.editForm);
    if (userStaff.id === null) {
      this.subscribeToSaveResponse(this.userStaffService.create(userStaff));
    } else {
      this.subscribeToSaveResponse(this.userStaffService.update(userStaff));
    }
  }

  protected subscribeToSaveResponse(result: Observable<IUserStaff | null>): void {
    result.pipe(finalize(() => this.onSaveFinalize())).subscribe({
      next: () => this.onSaveSuccess(),
      error: () => this.onSaveError(),
    });
  }

  protected onSaveSuccess(): void {
    this.previousState();
  }

  protected onSaveError(): void {
    // Api for inheritance.
  }

  protected onSaveFinalize(): void {
    this.isSaving.set(false);
  }

  protected updateForm(userStaff: IUserStaff): void {
    this.userStaff = userStaff;
    this.userStaffFormService.resetForm(this.editForm, userStaff);
  }
}
