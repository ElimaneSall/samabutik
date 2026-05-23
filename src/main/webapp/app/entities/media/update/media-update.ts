import { HttpResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import { MediaFormat } from 'app/entities/enumerations/media-format.model';
import { MediaType } from 'app/entities/enumerations/media-type.model';
import { IPack } from 'app/entities/pack/pack.model';
import { PackService } from 'app/entities/pack/service/pack.service';
import { IProduct } from 'app/entities/product/product.model';
import { ProductService } from 'app/entities/product/service/product.service';
import { AlertError } from 'app/shared/alert/alert-error';
import { TranslateDirective } from 'app/shared/language';

import { IMedia } from '../media.model';
import { MediaService } from '../service/media.service';

import { MediaFormGroup, MediaFormService } from './media-form.service';

@Component({
  selector: 'jhi-media-update',
  templateUrl: './media-update.html',
  imports: [TranslateDirective, TranslateModule, FontAwesomeModule, AlertError, ReactiveFormsModule],
})
export class MediaUpdate implements OnInit {
  readonly isSaving = signal(false);
  media: IMedia | null = null;
  mediaTypeValues = Object.keys(MediaType);
  mediaFormatValues = Object.keys(MediaFormat);

  productsSharedCollection = signal<IProduct[]>([]);
  packsSharedCollection = signal<IPack[]>([]);

  protected mediaService = inject(MediaService);
  protected mediaFormService = inject(MediaFormService);
  protected productService = inject(ProductService);
  protected packService = inject(PackService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: MediaFormGroup = this.mediaFormService.createMediaFormGroup();

  compareProduct = (o1: IProduct | null, o2: IProduct | null): boolean => this.productService.compareProduct(o1, o2);

  comparePack = (o1: IPack | null, o2: IPack | null): boolean => this.packService.comparePack(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ media }) => {
      this.media = media;
      if (media) {
        this.updateForm(media);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    globalThis.history.back();
  }

  save(): void {
    this.isSaving.set(true);
    const media = this.mediaFormService.getMedia(this.editForm);
    if (media.id === null) {
      this.subscribeToSaveResponse(this.mediaService.create(media));
    } else {
      this.subscribeToSaveResponse(this.mediaService.update(media));
    }
  }

  protected subscribeToSaveResponse(result: Observable<IMedia | null>): void {
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

  protected updateForm(media: IMedia): void {
    this.media = media;
    this.mediaFormService.resetForm(this.editForm, media);

    this.productsSharedCollection.update(products =>
      this.productService.addProductToCollectionIfMissing<IProduct>(products, media.productGallery),
    );
    this.packsSharedCollection.update(packs => this.packService.addPackToCollectionIfMissing<IPack>(packs, media.packGallery));
  }

  protected loadRelationshipsOptions(): void {
    this.productService
      .query()
      .pipe(map((res: HttpResponse<IProduct[]>) => res.body ?? []))
      .pipe(
        map((products: IProduct[]) => this.productService.addProductToCollectionIfMissing<IProduct>(products, this.media?.productGallery)),
      )
      .subscribe((products: IProduct[]) => this.productsSharedCollection.set(products));

    this.packService
      .query()
      .pipe(map((res: HttpResponse<IPack[]>) => res.body ?? []))
      .pipe(map((packs: IPack[]) => this.packService.addPackToCollectionIfMissing<IPack>(packs, this.media?.packGallery)))
      .subscribe((packs: IPack[]) => this.packsSharedCollection.set(packs));
  }
}
