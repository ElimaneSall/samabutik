import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslateModule } from '@ngx-translate/core';

import { Alert } from 'app/shared/alert/alert';
import { AlertError } from 'app/shared/alert/alert-error';
import { TranslateDirective } from 'app/shared/language';
import { IStockMovement } from '../stock-movement.model';

@Component({
  selector: 'jhi-stock-movement-detail',
  templateUrl: './stock-movement-detail.html',
  imports: [FontAwesomeModule, Alert, AlertError, TranslateDirective, TranslateModule, RouterLink],
})
export class StockMovementDetail {
  readonly stockMovement = input<IStockMovement | null>(null);

  previousState(): void {
    globalThis.history.back();
  }
}
