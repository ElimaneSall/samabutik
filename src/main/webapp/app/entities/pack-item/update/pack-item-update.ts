import { HttpResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import { IPack } from 'app/entities/pack/pack.model';
import { PackService } from 'app/entities/pack/service/pack.service';
import { IProduct } from 'app/entities/product/product.model';
import { ProductService } from 'app/entities/product/service/product.service';
import { AlertError } from 'app/shared/alert/alert-error';
import { TranslateDirective } from 'app/shared/language';
import { IPackItem } from '../pack-item.model';
import { PackItemService } from '../service/pack-item.service';

import { PackItemFormGroup, PackItemFormService } from './pack-item-form.service';

@Component({
  selector: 'jhi-pack-item-update',
  templateUrl: './pack-item-update.html',
  imports: [TranslateDirective, TranslateModule, FontAwesomeModule, AlertError, ReactiveFormsModule],
})
export class PackItemUpdate implements OnInit {
  readonly isSaving = signal(false);
  packItem: IPackItem | null = null;

  packsSharedCollection = signal<IPack[]>([]);
  productsSharedCollection = signal<IProduct[]>([]);

  protected packItemService = inject(PackItemService);
  protected packItemFormService = inject(PackItemFormService);
  protected packService = inject(PackService);
  protected productService = inject(ProductService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: PackItemFormGroup = this.packItemFormService.createPackItemFormGroup();

  comparePack = (o1: IPack | null, o2: IPack | null): boolean => this.packService.comparePack(o1, o2);

  compareProduct = (o1: IProduct | null, o2: IProduct | null): boolean => this.productService.compareProduct(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ packItem }) => {
      this.packItem = packItem;
      if (packItem) {
        this.updateForm(packItem);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    globalThis.history.back();
  }

  save(): void {
    this.isSaving.set(true);
    const packItem = this.packItemFormService.getPackItem(this.editForm);
    if (packItem.id === null) {
      this.subscribeToSaveResponse(this.packItemService.create(packItem));
    } else {
      this.subscribeToSaveResponse(this.packItemService.update(packItem));
    }
  }

  protected subscribeToSaveResponse(result: Observable<IPackItem | null>): void {
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

  protected updateForm(packItem: IPackItem): void {
    this.packItem = packItem;
    this.packItemFormService.resetForm(this.editForm, packItem);

    this.packsSharedCollection.update(packs => this.packService.addPackToCollectionIfMissing<IPack>(packs, packItem.pack));
    this.productsSharedCollection.update(products =>
      this.productService.addProductToCollectionIfMissing<IProduct>(products, packItem.product),
    );
  }

  protected loadRelationshipsOptions(): void {
    this.packService
      .query()
      .pipe(map((res: HttpResponse<IPack[]>) => res.body ?? []))
      .pipe(map((packs: IPack[]) => this.packService.addPackToCollectionIfMissing<IPack>(packs, this.packItem?.pack)))
      .subscribe((packs: IPack[]) => this.packsSharedCollection.set(packs));

    this.productService
      .query()
      .pipe(map((res: HttpResponse<IProduct[]>) => res.body ?? []))
      .pipe(map((products: IProduct[]) => this.productService.addProductToCollectionIfMissing<IProduct>(products, this.packItem?.product)))
      .subscribe((products: IProduct[]) => this.productsSharedCollection.set(products));
  }
}
