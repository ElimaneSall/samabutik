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
import { TranslateDirective } from 'app/shared/language';
import { ItemCount } from 'app/shared/pagination';
import { SortByDirective, SortDirective, SortService, type SortState, sortStateSignal } from 'app/shared/sort';
import { ProductDeleteDialog } from '../delete/product-delete-dialog';
import { IProduct } from '../product.model';
import { ProductService } from '../service/product.service';

@Component({
  selector: 'jhi-product',
  templateUrl: './product.html',
  styleUrls: ['./product.scss'],
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
export class Product implements OnInit {
  subscription: Subscription | null = null;
  readonly products = signal<IProduct[]>([]);

  sortState = sortStateSignal({});

  readonly itemsPerPage = signal(ITEMS_PER_PAGE);
  readonly totalItems = signal(0);
  readonly page = signal(1);

  // 🔹 Filtres (requis par le template)
  searchTerm = '';
  selectedCategory = '';
  stockFilter = 'all';

  readonly router = inject(Router);
  protected readonly productService = inject(ProductService);
  readonly isLoading = this.productService.productsResource.isLoading;
  protected readonly activatedRoute = inject(ActivatedRoute);
  protected readonly sortService = inject(SortService);
  protected modalService = inject(NgbModal);

  // Dans ngOnInit(), juste après le subscribe
  ngOnInit(): void {
    console.log('🚀 Product component initializing...');

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

  // Dans le constructor, après les effects
  constructor() {
    console.log('🔧 Product constructor called');

    effect(() => {
      const headers = this.productService.productsResource.headers();
      if (headers) {
        console.log('📬 Headers received:', headers.get('X-Total-Count'));
        this.fillComponentAttributesFromResponseHeader(headers);
      }
    });

    effect(() => {
      const products = this.productService.products();
      console.log('📦 Products signal updated:', products.length, 'items');
      this.products.set(this.fillComponentAttributesFromResponseBody([...products]));
    });
  }
  // 🔹 Computed values pour les stats cards
  totalStockValue = (): number => {
    return this.products().reduce((sum, p) => sum + (p.price ?? 0) * (p.stock ?? 0), 0);
  };

  lowStockCount = (): number => {
    return this.products().filter(p => (p.stock ?? 0) <= (p.lowStockThreshold ?? 5)).length;
  };

  categoriesList = (): string[] => {
    const categories = new Set(
      this.products()
        .map(p => p.category)
        .filter(c => c) as string[],
    );
    return Array.from(categories);
  };

  categoriesCount = (): number => {
    return this.categoriesList().length;
  };

  trackId = (item: IProduct): number => this.productService.getProductIdentifier(item);

  delete(product: IProduct): void {
    const modalRef = this.modalService.open(ProductDeleteDialog, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.product = product;
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
    this.selectedCategory = params.get('category') ?? '';
    this.stockFilter = params.get('stockFilter') ?? 'all';
  }

  protected fillComponentAttributesFromResponseBody(data: IProduct[]): IProduct[] {
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

    // 🔹 Ajout des filtres
    if (this.searchTerm) {
      queryObject.search = this.searchTerm;
    }
    if (this.selectedCategory) {
      queryObject.category = this.selectedCategory;
    }
    if (this.stockFilter !== 'all') {
      queryObject.stockFilter = this.stockFilter;
    }

    this.productService.productsParams.set(queryObject);
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
    if (this.selectedCategory) {
      queryParamsObj.category = this.selectedCategory;
    }
    if (this.stockFilter !== 'all') {
      queryParamsObj.stockFilter = this.stockFilter;
    }

    this.router.navigate(['./'], {
      relativeTo: this.activatedRoute,
      queryParams: queryParamsObj,
    });
  }

  // 🔹 Méthodes de filtrage (requis par le template)
  onSearchChange(value: string): void {
    this.searchTerm = value;
    this.page.set(1);
    this.load();
  }

  onCategoryChange(value: string): void {
    this.selectedCategory = value;
    this.page.set(1);
    this.load();
  }

  onStockFilterChange(value: string): void {
    this.stockFilter = value;
    this.page.set(1);
    this.load();
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = '';
    this.stockFilter = 'all';
    this.page.set(1);
    this.load();
  }

  // 🔹 Méthode d'export CSV (requis par le template)
  exportCSV(): void {
    this.productService.exportCSV().subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `products_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: err => {
        console.error("Erreur lors de l'export CSV:", err);
      },
    });
  }

  // 🔹 Méthode de tri des colonnes (requis par le template)
  sort(predicate: string): void {
    const currentOrder = this.sortState().order;
    const newOrder = currentOrder === 'asc' ? 'desc' : 'asc';
    this.sortState.set({ predicate, order: newOrder });
    this.navigateToWithComponentValues(this.sortState());
  }
}
