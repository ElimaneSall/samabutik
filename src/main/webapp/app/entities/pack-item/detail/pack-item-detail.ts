import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslateModule } from '@ngx-translate/core';

import { Alert } from 'app/shared/alert/alert';
import { AlertError } from 'app/shared/alert/alert-error';
import { TranslateDirective } from 'app/shared/language';
import { IPackItem } from '../pack-item.model';

@Component({
  selector: 'jhi-pack-item-detail',
  templateUrl: './pack-item-detail.html',
  imports: [FontAwesomeModule, Alert, AlertError, TranslateDirective, TranslateModule, RouterLink],
})
export class PackItemDetail {
  readonly packItem = input<IPackItem | null>(null);

  previousState(): void {
    globalThis.history.back();
  }
}
