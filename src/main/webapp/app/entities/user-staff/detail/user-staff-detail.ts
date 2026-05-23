import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslateModule } from '@ngx-translate/core';

import { Alert } from 'app/shared/alert/alert';
import { AlertError } from 'app/shared/alert/alert-error';
import { FormatMediumDatetimePipe } from 'app/shared/date';
import { TranslateDirective } from 'app/shared/language';
import { IUserStaff } from '../user-staff.model';

@Component({
  selector: 'jhi-user-staff-detail',
  templateUrl: './user-staff-detail.html',
  imports: [FontAwesomeModule, Alert, AlertError, TranslateDirective, TranslateModule, RouterLink, FormatMediumDatetimePipe],
})
export class UserStaffDetail {
  readonly userStaff = input<IUserStaff | null>(null);

  previousState(): void {
    globalThis.history.back();
  }
}
