import { HttpResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import { IMedia } from 'app/entities/media/media.model';
import { MediaService } from 'app/entities/media/service/media.service';
import { AlertError } from 'app/shared/alert/alert-error';
import { TranslateDirective } from 'app/shared/language';
import { IProduct } from '../product.model';
import { ProductService } from '../service/product.service';

import { ProductFormGroup, ProductFormService } from './product-form.service';

@Component({
  selector: 'jhi-product-update',
  templateUrl: './product-update.html',
  imports: [TranslateDirective, TranslateModule, FontAwesomeModule, AlertError, ReactiveFormsModule],
})
export class ProductUpdate implements OnInit {
  readonly isSaving = signal(false);
  product: IProduct | null = null;

  mainMediasCollection = signal<IMedia[]>([]);

  protected productService = inject(ProductService);
  protected productFormService = inject(ProductFormService);
  protected mediaService = inject(MediaService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: ProductFormGroup = this.productFormService.createProductFormGroup();

  compareMedia = (o1: IMedia | null, o2: IMedia | null): boolean => this.mediaService.compareMedia(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ product }) => {
      this.product = product;
      if (product) {
        this.updateForm(product);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    globalThis.history.back();
  }

  save(): void {
    this.isSaving.set(true);
    const product = this.productFormService.getProduct(this.editForm);
    if (product.id === null) {
      this.subscribeToSaveResponse(this.productService.create(product));
    } else {
      this.subscribeToSaveResponse(this.productService.update(product));
    }
  }

  protected subscribeToSaveResponse(result: Observable<IProduct | null>): void {
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

  protected updateForm(product: IProduct): void {
    this.product = product;
    this.productFormService.resetForm(this.editForm, product);

    this.mainMediasCollection.set(this.mediaService.addMediaToCollectionIfMissing<IMedia>(this.mainMediasCollection(), product.mainMedia));
  }

  protected loadRelationshipsOptions(): void {
    this.mediaService
      .query({ filter: 'productmain-is-null' })
      .pipe(map((res: HttpResponse<IMedia[]>) => res.body ?? []))
      .pipe(map((medias: IMedia[]) => this.mediaService.addMediaToCollectionIfMissing<IMedia>(medias, this.product?.mainMedia)))
      .subscribe((medias: IMedia[]) => this.mainMediasCollection.set(medias));
  }
}
