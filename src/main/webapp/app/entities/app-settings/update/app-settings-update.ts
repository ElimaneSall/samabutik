import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { AlertError } from 'app/shared/alert/alert-error';
import { TranslateDirective } from 'app/shared/language';
import { IAppSettings } from '../app-settings.model';
import { AppSettingsService } from '../service/app-settings.service';

import { AppSettingsFormGroup, AppSettingsFormService } from './app-settings-form.service';

@Component({
  selector: 'jhi-app-settings-update',
  templateUrl: './app-settings-update.html',
  imports: [TranslateDirective, TranslateModule, FontAwesomeModule, AlertError, ReactiveFormsModule],
})
export class AppSettingsUpdate implements OnInit {
  readonly isSaving = signal(false);
  appSettings: IAppSettings | null = null;

  protected appSettingsService = inject(AppSettingsService);
  protected appSettingsFormService = inject(AppSettingsFormService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: AppSettingsFormGroup = this.appSettingsFormService.createAppSettingsFormGroup();

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ appSettings }) => {
      this.appSettings = appSettings;
      if (appSettings) {
        this.updateForm(appSettings);
      }
    });
  }

  previousState(): void {
    globalThis.history.back();
  }

  save(): void {
    this.isSaving.set(true);
    const appSettings = this.appSettingsFormService.getAppSettings(this.editForm);
    if (appSettings.id === null) {
      this.subscribeToSaveResponse(this.appSettingsService.create(appSettings));
    } else {
      this.subscribeToSaveResponse(this.appSettingsService.update(appSettings));
    }
  }

  protected subscribeToSaveResponse(result: Observable<IAppSettings | null>): void {
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

  protected updateForm(appSettings: IAppSettings): void {
    this.appSettings = appSettings;
    this.appSettingsFormService.resetForm(this.editForm, appSettings);
  }
}
