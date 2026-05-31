import { DecimalPipe } from '@angular/common';
import { HttpHeaders } from '@angular/common/http';
import { Component, OnInit, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Data, ParamMap, Router, RouterLink } from '@angular/router';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap/modal';
import { NgbPagination } from '@ng-bootstrap/ng-bootstrap/pagination';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription, combineLatest, filter, tap } from 'rxjs';

import { DEFAULT_SORT_DATA, ITEM_DELETED_EVENT, SORT } from 'app/config/navigation.constants';
import { ITEMS_PER_PAGE, PAGE_HEADER, TOTAL_COUNT_RESPONSE_HEADER } from 'app/config/pagination.constants';
import { Alert } from 'app/shared/alert/alert';
import { AlertError } from 'app/shared/alert/alert-error';
import { FormatMediumDatetimePipe } from 'app/shared/date';
import { TranslateDirective } from 'app/shared/language';
import { ItemCount } from 'app/shared/pagination';
import { SortByDirective, SortDirective, SortService, type SortState, sortStateSignal } from 'app/shared/sort';
import { OrderDeleteDialog } from '../delete/order-delete-dialog';
import { IOrder } from '../order.model';
import { OrderService } from '../service/order.service';

@Component({
  selector: 'jhi-order',
  templateUrl: './order.html',
  styleUrls: ['./order.scss'],
  imports: [
    RouterLink,
    FormsModule,
    FontAwesomeModule,
    AlertError,
    Alert,
    TranslateDirective,
    TranslateModule,
    FormatMediumDatetimePipe,
    NgbPagination,
    ItemCount,
    DecimalPipe,
  ],
})
export class Order implements OnInit {
  subscription: Subscription | null = null;
  readonly orders = signal<IOrder[]>([]);

  readonly sortState = sortStateSignal({ predicate: 'id', order: 'desc' });

  readonly itemsPerPage = signal(ITEMS_PER_PAGE);
  readonly totalItems = signal(0);
  readonly page = signal(1);

  searchTerm = '';
  selectedStatus = '';
  selectedPaymentStatus = '';

  readonly router = inject(Router);
  protected readonly orderService = inject(OrderService);
  readonly isLoading = this.orderService.ordersResource.isLoading;
  protected readonly activatedRoute = inject(ActivatedRoute);
  protected readonly sortService = inject(SortService);
  protected modalService = inject(NgbModal);

  constructor() {
    effect(() => {
      const headers = this.orderService.ordersResource.headers();
      if (headers) {
        this.fillComponentAttributesFromResponseHeader(headers);
      }
    });

    effect(() => {
      this.orders.set(this.fillComponentAttributesFromResponseBody([...this.orderService.orders()]));
    });
  }

  ngOnInit(): void {
    this.subscription = combineLatest([this.activatedRoute.queryParamMap, this.activatedRoute.data])
      .pipe(
        tap(([params, data]) => this.fillComponentAttributeFromRoute(params, data)),
        tap(() => this.load()),
      )
      .subscribe();
  }

  totalRevenue = (): number => {
    return this.orders().reduce((sum, order) => sum + (order.totalAmount ?? 0), 0);
  };

  pendingOrdersCount = (): number => {
    return this.orders().filter(order => order.status === 'PENDING' || order.status === 'PAID').length;
  };

  deliveredOrdersCount = (): number => {
    return this.orders().filter(order => order.status === 'DELIVERED').length;
  };

  trackId = (item: IOrder): number => this.orderService.getOrderIdentifier(item);

  delete(order: IOrder): void {
    const modalRef = this.modalService.open(OrderDeleteDialog, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.order = order;
    modalRef.closed
      .pipe(
        filter(reason => reason === ITEM_DELETED_EVENT),
        tap(() => this.load()),
      )
      .subscribe();
  }

  load(): void {
    this.queryBackend();
  }

  navigateToWithComponentValues(event: SortState): void {
    this.handleNavigation(this.page(), event);
  }

  navigateToPage(page: number): void {
    this.handleNavigation(page, this.sortState());
  }

  protected fillComponentAttributeFromRoute(params: ParamMap, data: Data): void {
    const page = params.get(PAGE_HEADER);
    this.page.set(+(page ?? 1));

    const sortParam = params.get(SORT) ?? data[DEFAULT_SORT_DATA];
    if (sortParam) {
      this.sortState.set(this.sortService.parseSortParam(sortParam));
    } else {
      this.sortState.set({ predicate: 'id', order: 'desc' });
    }

    this.searchTerm = params.get('search') ?? '';
    this.selectedStatus = params.get('status') ?? '';
    this.selectedPaymentStatus = params.get('paymentStatus') ?? '';
  }

  protected fillComponentAttributesFromResponseBody(data: IOrder[]): IOrder[] {
    return data;
  }

  protected fillComponentAttributesFromResponseHeader(headers: HttpHeaders): void {
    this.totalItems.set(Number(headers.get(TOTAL_COUNT_RESPONSE_HEADER)));
  }

  protected queryBackend(): void {
    const pageToLoad: number = this.page();
    const sortState = this.sortState();

    let sortParam = '';
    if (sortState.predicate && sortState.order) {
      sortParam = `${sortState.predicate},${sortState.order}`;
    }

    const queryObject: any = {
      page: pageToLoad - 1,
      size: this.itemsPerPage(),
      sort: sortParam,
    };

    if (this.searchTerm) {
      queryObject.search = this.searchTerm;
    }
    if (this.selectedStatus) {
      queryObject.status = this.selectedStatus;
    }
    if (this.selectedPaymentStatus) {
      queryObject.paymentStatus = this.selectedPaymentStatus;
    }

    this.orderService.ordersParams.set(queryObject);
  }

  protected handleNavigation(page: number, sortState: SortState): void {
    const queryParamsObj: any = {
      page,
      size: this.itemsPerPage(),
    };

    if (sortState.predicate && sortState.order) {
      queryParamsObj.sort = `${sortState.predicate},${sortState.order}`;
    }

    if (this.searchTerm) {
      queryParamsObj.search = this.searchTerm;
    }
    if (this.selectedStatus) {
      queryParamsObj.status = this.selectedStatus;
    }
    if (this.selectedPaymentStatus) {
      queryParamsObj.paymentStatus = this.selectedPaymentStatus;
    }

    this.router.navigate(['./'], {
      relativeTo: this.activatedRoute,
      queryParams: queryParamsObj,
    });
  }

  onSearchChange(value: string): void {
    this.searchTerm = value;
    this.page.set(1);
    this.load();
  }

  onStatusChange(value: string): void {
    this.selectedStatus = value;
    this.page.set(1);
    this.load();
  }

  onPaymentStatusChange(value: string): void {
    this.selectedPaymentStatus = value;
    this.page.set(1);
    this.load();
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = '';
    this.selectedPaymentStatus = '';
    this.page.set(1);
    this.sortState.set({ predicate: 'id', order: 'desc' });
    this.load();
  }

  exportCSV(): void {
    this.orderService.exportCSV().subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `orders_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: err => {
        console.error("Erreur lors de l'export CSV:", err);
      },
    });
  }

  sort(predicate: string): void {
    const currentOrder = this.sortState().order;
    const newOrder = currentOrder === 'asc' ? 'desc' : 'asc';
    this.sortState.set({ predicate, order: newOrder });
    this.navigateToWithComponentValues(this.sortState());
  }
}
