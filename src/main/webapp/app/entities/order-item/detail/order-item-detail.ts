import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslateModule } from '@ngx-translate/core';

import { Alert } from 'app/shared/alert/alert';
import { AlertError } from 'app/shared/alert/alert-error';
import { TranslateDirective } from 'app/shared/language';
import { IOrderItem } from '../order-item.model';

@Component({
  selector: 'jhi-order-item-detail',
  templateUrl: './order-item-detail.html',
  imports: [FontAwesomeModule, Alert, AlertError, TranslateDirective, TranslateModule, RouterLink],
})
export class OrderItemDetail {
  readonly orderItem = input<IOrderItem | null>(null);

  previousState(): void {
    globalThis.history.back();
  }
}
