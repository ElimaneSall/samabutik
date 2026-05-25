import { DecimalPipe, NgFor } from '@angular/common';
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
import { PackDeleteDialog } from '../delete/pack-delete-dialog';
import { IPack } from '../pack.model';
import { PackService } from '../service/pack.service';
import { DiscountType } from '../../enumerations/discount-type.model';

@Component({
  selector: 'jhi-pack',
  templateUrl: './pack.html',
  styleUrls: ['./pack.css'],
  imports: [
    RouterLink,
    FormsModule,
    FontAwesomeModule,
    AlertError,
    Alert,
    TranslateDirective,
    TranslateModule,
    NgbPagination,
    ItemCount,
    DecimalPipe,
  ],
})
export class Pack implements OnInit {
  subscription: Subscription | null = null;
  readonly packs = signal<IPack[]>([]);

  sortState = sortStateSignal({});

  readonly itemsPerPage = signal(ITEMS_PER_PAGE);
  readonly totalItems = signal(0);
  readonly page = signal(1);

  // 🔹 Filtres
  searchTerm = '';
  selectedDiscountType = '';
  activeFilter = 'all'; // 'all', 'active', 'inactive'

  readonly router = inject(Router);
  protected readonly packService = inject(PackService);
  readonly isLoading = this.packService.packsResource.isLoading;
  protected readonly activatedRoute = inject(ActivatedRoute);
  protected readonly sortService = inject(SortService);
  protected modalService = inject(NgbModal);

  // 🔹 Enum pour le template
  readonly DiscountType = DiscountType;

  constructor() {
    console.log('🔧 Pack constructor called');

    effect(() => {
      const headers = this.packService.packsResource.headers();
      if (headers) {
        console.log('📬 Headers received:', headers.get('X-Total-Count'));
        this.fillComponentAttributesFromResponseHeader(headers);
      }
    });

    effect(() => {
      const packs = this.packService.packs();
      console.log('📦 Packs signal updated:', packs.length, 'items');
      this.packs.set(this.fillComponentAttributesFromResponseBody([...packs]));
    });
  }

  ngOnInit(): void {
    console.log('🚀 Pack component initializing...');

    this.subscription = combineLatest([this.activatedRoute.queryParamMap, this.activatedRoute.data])
      .pipe(
        tap(([params, data]) => {
          console.log('📦 Route params:', params);
          console.log('📦 Route data:', data);
          this.fillComponentAttributeFromRoute(params, data);
        }),
        tap(() => {
          console.log('🔄 Calling load()...');
          this.load();
        }),
      )
      .subscribe({
        next: () => console.log('✅ Subscription successful'),
        error: err => console.error('❌ Subscription error:', err),
      });
  }

  // 🔹 Computed values pour les stats cards
  totalDiscountValue = (): number => {
    return this.packs().reduce((sum, p) => {
      if (p.discountType === 'PERCENT' && p.discountValue) {
        return sum + p.discountValue;
      }
      if (p.discountType === 'FIXED' && p.discountValue) {
        return sum + p.discountValue;
      }
      return sum;
    }, 0);
  };

  activePacksCount = (): number => {
    return this.packs().filter(p => p.isActive === true).length;
  };

  homepagePacksCount = (): number => {
    return this.packs().filter(p => p.displayOnHomepage === true).length;
  };

  discountTypesList = (): string[] => {
    const types = new Set(
      this.packs()
        .map(p => p.discountType)
        .filter(t => t) as string[],
    );
    return Array.from(types);
  };

  trackId = (item: IPack): number => this.packService.getPackIdentifier(item);

  delete(pack: IPack): void {
    const modalRef = this.modalService.open(PackDeleteDialog, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.pack = pack;
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
    this.sortState.set(this.sortService.parseSortParam(params.get(SORT) ?? data[DEFAULT_SORT_DATA]));

    // 🔹 Restaurer les filtres depuis l'URL
    this.searchTerm = params.get('search') ?? '';
    this.selectedDiscountType = params.get('discountType') ?? '';
    this.activeFilter = params.get('activeFilter') ?? 'all';
  }

  protected fillComponentAttributesFromResponseBody(data: IPack[]): IPack[] {
    return data;
  }

  protected fillComponentAttributesFromResponseHeader(headers: HttpHeaders): void {
    this.totalItems.set(Number(headers.get(TOTAL_COUNT_RESPONSE_HEADER)));
  }

  protected queryBackend(): void {
    const pageToLoad: number = this.page();
    const queryObject: any = {
      page: pageToLoad - 1,
      size: this.itemsPerPage(),
      sort: this.sortService.buildSortParam(this.sortState()),
    };

    if (this.searchTerm) {
      queryObject.search = this.searchTerm;
    }
    if (this.selectedDiscountType) {
      queryObject.discountType = this.selectedDiscountType;
    }
    if (this.activeFilter !== 'all') {
      queryObject.displayOnHomepage = this.activeFilter == 'active' ? true : false;
    }

    this.packService.packsParams.set(queryObject);
  }

  protected handleNavigation(page: number, sortState: SortState): void {
    const queryParamsObj: any = {
      page,
      size: this.itemsPerPage(),
      sort: this.sortService.buildSortParam(sortState),
    };

    // 🔹 Conserver les filtres dans l'URL
    if (this.searchTerm) {
      queryParamsObj.search = this.searchTerm;
    }
    if (this.selectedDiscountType) {
      queryParamsObj.discountType = this.selectedDiscountType;
    }
    if (this.activeFilter !== 'all') {
      queryParamsObj.activeFilter = this.activeFilter;
    }

    this.router.navigate(['./'], {
      relativeTo: this.activatedRoute,
      queryParams: queryParamsObj,
    });
  }

  // 🔹 Méthodes de filtrage
  onSearchChange(value: string): void {
    this.searchTerm = value;
    this.page.set(1);
    this.load();
  }

  onDiscountTypeChange(value: string): void {
    this.selectedDiscountType = value;
    this.page.set(1);
    this.load();
  }

  onActiveFilterChange(value: string): void {
    this.activeFilter = value;
    this.page.set(1);
    this.load();
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedDiscountType = '';
    this.activeFilter = 'all';
    this.page.set(1);
    this.load();
  }

  // 🔹 Méthode d'export CSV
  exportCSV(): void {
    this.packService.exportCSV().subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `packs_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: err => {
        console.error("Erreur lors de l'export CSV:", err);
      },
    });
  }

  // 🔹 Méthode de tri des colonnes
  sort(predicate: string): void {
    const currentOrder = this.sortState().order;
    const newOrder = currentOrder === 'asc' ? 'desc' : 'asc';
    this.sortState.set({ predicate, order: newOrder });
    this.navigateToWithComponentValues(this.sortState());
  }

  // 🔹 Helpers pour le template
  getDiscountLabel(type: keyof typeof DiscountType | null): string {
    if (!type) return '-';
    const labels: Record<keyof typeof DiscountType, string> = {
      PERCENT: 'Pourcentage',
      FIXED: 'Montant fixe',
    };
    return labels[type] || type;
  }

  formatDate(date: any): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('fr-FR');
  }
}
