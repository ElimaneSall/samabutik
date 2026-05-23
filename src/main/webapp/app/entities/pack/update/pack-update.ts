import { HttpResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import { DiscountType } from 'app/entities/enumerations/discount-type.model';
import { IMedia } from 'app/entities/media/media.model';
import { MediaService } from 'app/entities/media/service/media.service';
import { AlertError } from 'app/shared/alert/alert-error';
import { TranslateDirective } from 'app/shared/language';
import { IPack } from '../pack.model';
import { PackService } from '../service/pack.service';

import { PackFormGroup, PackFormService } from './pack-form.service';

@Component({
  selector: 'jhi-pack-update',
  templateUrl: './pack-update.html',
  imports: [TranslateDirective, TranslateModule, FontAwesomeModule, AlertError, ReactiveFormsModule],
})
export class PackUpdate implements OnInit {
  readonly isSaving = signal(false);
  pack: IPack | null = null;
  discountTypeValues = Object.keys(DiscountType);

  mainMediasCollection = signal<IMedia[]>([]);

  protected packService = inject(PackService);
  protected packFormService = inject(PackFormService);
  protected mediaService = inject(MediaService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: PackFormGroup = this.packFormService.createPackFormGroup();

  compareMedia = (o1: IMedia | null, o2: IMedia | null): boolean => this.mediaService.compareMedia(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ pack }) => {
      this.pack = pack;
      if (pack) {
        this.updateForm(pack);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    globalThis.history.back();
  }

  save(): void {
    this.isSaving.set(true);
    const pack = this.packFormService.getPack(this.editForm);
    if (pack.id === null) {
      this.subscribeToSaveResponse(this.packService.create(pack));
    } else {
      this.subscribeToSaveResponse(this.packService.update(pack));
    }
  }

  protected subscribeToSaveResponse(result: Observable<IPack | null>): void {
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

  protected updateForm(pack: IPack): void {
    this.pack = pack;
    this.packFormService.resetForm(this.editForm, pack);

    this.mainMediasCollection.set(this.mediaService.addMediaToCollectionIfMissing<IMedia>(this.mainMediasCollection(), pack.mainMedia));
  }

  protected loadRelationshipsOptions(): void {
    this.mediaService
      .query({ filter: 'packmain-is-null' })
      .pipe(map((res: HttpResponse<IMedia[]>) => res.body ?? []))
      .pipe(map((medias: IMedia[]) => this.mediaService.addMediaToCollectionIfMissing<IMedia>(medias, this.pack?.mainMedia)))
      .subscribe((medias: IMedia[]) => this.mainMediasCollection.set(medias));
  }
}
