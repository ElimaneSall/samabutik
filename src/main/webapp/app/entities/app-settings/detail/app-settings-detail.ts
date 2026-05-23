import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslateModule } from '@ngx-translate/core';

import { Alert } from 'app/shared/alert/alert';
import { AlertError } from 'app/shared/alert/alert-error';
import { TranslateDirective } from 'app/shared/language';
import { IAppSettings } from '../app-settings.model';

@Component({
  selector: 'jhi-app-settings-detail',
  templateUrl: './app-settings-detail.html',
  imports: [FontAwesomeModule, Alert, AlertError, TranslateDirective, TranslateModule, RouterLink],
})
export class AppSettingsDetail {
  readonly appSettings = input<IAppSettings | null>(null);

  previousState(): void {
    globalThis.history.back();
  }
}
