import { HttpResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal, ViewChild, ElementRef } from '@angular/core';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, finalize, map } from 'rxjs';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';

import { AlertError } from 'app/shared/alert/alert-error';
import { TranslateDirective } from 'app/shared/language';
import { IMedia } from 'app/entities/media/media.model';
import { MediaService } from 'app/entities/media/service/media.service';
import { IProduct, NewProduct } from '../product.model';
import { ProductService } from '../service/product.service';
import { ProductFormGroup, ProductFormService } from './product-form.service';

interface FileWithPreview extends File {
  previewUrl?: string;
  isMarkedAsMain?: boolean;
}

interface GalleryItem {
  file?: FileWithPreview;
  media?: Pick<IMedia, 'id' | 'url'>;
  id: number;
  previewUrl: string;
  isNew: boolean;
}

@Component({
  selector: 'jhi-product-update',
  templateUrl: './product-update.html',
  styleUrl: './product-update.css',
  imports: [CommonModule, TranslateDirective, TranslateModule, FontAwesomeModule, ReactiveFormsModule],
})
export class ProductUpdate implements OnInit {
  readonly isSaving = signal(false);
  readonly uploadError = signal<string | null>(null);
  readonly saveMode = signal<'create' | 'update'>('create');
  readonly previewData = signal({ name: '', sku: '', price: 0, cost: 0 });

  product: IProduct | null = null;
  editForm: ProductFormGroup;
  selectedMainFile: FileWithPreview | null = null;
  selectedGalleryFiles = signal<GalleryItem[]>([]);
  readonly isMainFileSet = signal(false);
  readonly dragOver = signal(false);
  readonly mainMediasCollection = signal<IMedia[]>([]);

  private readonly MAX_IMAGE_SIZE = 2 * 1024 * 1024;
  private readonly MAX_VIDEO_SIZE = 50 * 1024 * 1024;
  private readonly ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  private readonly ALLOWED_VIDEO_TYPES = ['video/mp4'];

  @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;
  protected readonly fb = inject(FormBuilder);
  protected readonly productService = inject(ProductService);
  protected readonly productFormService = inject(ProductFormService);
  protected readonly mediaService = inject(MediaService);
  protected readonly activatedRoute = inject(ActivatedRoute);
  protected readonly router = inject(Router);
  readonly categoriesList = signal<string[]>([]);

  constructor() {
    this.editForm = this.productFormService.createProductFormGroup();
    this.editForm.valueChanges.subscribe(values => {
      this.previewData.update(data => ({
        ...data,
        name: values.name || data.name,
        sku: values.sku || data.sku,
        price: values.price || data.price,
        cost: values.costPrice || data.cost,
      }));
    });
  }

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ product }) => {
      this.product = product;
      this.saveMode.set(product?.id ? 'update' : 'create');
      if (product) {
        this.updateForm(product);
      }
      this.loadRelationshipsOptions();
      this.loadCategories(); // ← Ajoute cette ligne
    });
  }

  private loadCategories(): void {
    this.productService.query({ size: 1000 }).subscribe({
      next: res => {
        const categories = [...new Set(res.body?.map(p => p.category).filter(c => c) as string[])];
        this.categoriesList.set(categories);
      },
      error: () => this.categoriesList.set([]),
    });
  }
  protected updateForm(product: IProduct): void {
    this.product = product;
    this.productFormService.resetForm(this.editForm, product);
    this.mainMediasCollection.set(this.mediaService.addMediaToCollectionIfMissing(this.mainMediasCollection(), product.mainMedia));
    // Charger les médias existants de la galerie
    if (product.gallery?.length) {
      const existingGallery = product.gallery.map((media, index) => ({
        media,
        id: media.id ?? index,
        previewUrl: media.url || '',
        isNew: false,
      }));
      this.selectedGalleryFiles.set(existingGallery);
    }
    // Charger l'image principale existante
    if (product.mainMedia?.url) {
      this.isMainFileSet.set(true);
    }
  }

  protected loadRelationshipsOptions(): void {
    if (this.saveMode() === 'update') {
      this.mediaService
        .query({ filter: 'productmain-is-null' })
        .pipe(
          map((res: HttpResponse<IMedia[]>) => res.body ?? []),
          map(medias => this.mediaService.addMediaToCollectionIfMissing(medias, this.product?.mainMedia)),
        )
        .subscribe(medias => this.mainMediasCollection.set(medias));
    }
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (!files?.length) return;

    Array.from(files).forEach(file => {
      const error = this.validateFile(file);
      if (error) {
        this.uploadError.set(error);
        return;
      }
      this.createPreview(file).then(previewUrl => {
        const fileWithPreview = Object.assign(file, { previewUrl, isMarkedAsMain: false }) as FileWithPreview;
        if (!this.selectedMainFile && file.type.startsWith('image/')) {
          this.selectedMainFile = fileWithPreview;
          this.markAsMain(fileWithPreview, 'main');
        } else {
          this.addGalleryFile(fileWithPreview, previewUrl);
        }
        this.uploadError.set(null);
      });
    });
    input.value = '';
  }

  private validateFile(file: File): string | null {
    if (file.size === 0) return 'Fichier vide';
    if (file.type.startsWith('image/')) {
      if (!this.ALLOWED_IMAGE_TYPES.includes(file.type)) return 'Format image non supporté';
      if (file.size > this.MAX_IMAGE_SIZE) return 'Image trop lourde (max 2Mo)';
    } else if (file.type.startsWith('video/')) {
      if (!this.ALLOWED_VIDEO_TYPES.includes(file.type)) return 'Format vidéo non supporté';
      if (file.size > this.MAX_VIDEO_SIZE) return 'Vidéo trop lourde (max 50Mo)';
    } else {
      return 'Type de fichier non supporté';
    }
    return null;
  }

  private createPreview(file: File): Promise<string> {
    return new Promise(resolve => {
      if (!file.type.startsWith('image/')) {
        resolve('/content/images/video-placeholder.png');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => resolve((e.target?.result as string) || '');
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  }

  markAsMain(file: FileWithPreview, source: 'main' | 'gallery'): void {
    if (this.selectedMainFile) this.selectedMainFile.isMarkedAsMain = false;
    this.selectedGalleryFiles.update(files =>
      files.map(f => {
        if (f.file) f.file.isMarkedAsMain = false;
        return f;
      }),
    );
    if (source === 'main' && this.selectedMainFile) {
      this.selectedMainFile.isMarkedAsMain = true;
    } else if (source === 'gallery') {
      file.isMarkedAsMain = true;
    }
    this.isMainFileSet.set(
      this.selectedMainFile?.isMarkedAsMain === true || this.selectedGalleryFiles().some(f => f.file?.isMarkedAsMain === true),
    );
  }

  addGalleryFile(file: FileWithPreview, previewUrl: string): void {
    this.selectedGalleryFiles.update(files => [...files, { file, id: Date.now() + Math.random(), previewUrl, isNew: true }]);
  }

  removeGalleryFile(index: number): void {
    this.selectedGalleryFiles.update(files => {
      const newFiles = [...files];
      newFiles.splice(index, 1);
      return newFiles;
    });
    this.isMainFileSet.set(
      this.selectedMainFile?.isMarkedAsMain === true || this.selectedGalleryFiles().some(f => f.file?.isMarkedAsMain === true),
    );
  }

  removeMainImage(): void {
    this.selectedMainFile = null;
    this.isMainFileSet.set(this.selectedGalleryFiles().some(f => f.file?.isMarkedAsMain === true));
  }

  removeExistingMedia(mediaId: number): void {
    this.selectedGalleryFiles.update(files => files.filter(f => f.media?.id !== mediaId));
  }

  clearAllFiles(): void {
    this.selectedMainFile = null;
    this.selectedGalleryFiles.set([]);
    this.isMainFileSet.set(false);
    this.uploadError.set(null);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver.set(false);
    const files = event.dataTransfer?.files;
    if (files?.length) this.onFilesSelected({ target: { files } } as unknown as Event);
  }

  triggerFileInput(): void {
    this.fileInput?.nativeElement.click();
  }

  private validateBeforeSave(): string | null {
    if (!this.editForm.valid) return 'Veuillez remplir tous les champs obligatoires';
    const hasFiles = !!this.selectedMainFile || this.selectedGalleryFiles().length > 0;
    if (this.saveMode() === 'create' && !hasFiles) return 'Veuillez ajouter au moins un média';
    if (hasFiles && !this.isMainFileSet()) return 'Veuillez sélectionner une image principale';
    return null;
  }

  save(): void {
    const error = this.validateBeforeSave();
    if (error) {
      this.uploadError.set(error);
      return;
    }
    this.isSaving.set(true);
    this.uploadError.set(null);
    const payload = this.prepareProductPayload();
    if (this.saveMode() === 'create' && this.hasFilesToUpload()) {
      this.saveWithMultipart(payload);
    } else {
      this.saveWithJson(payload);
    }
  }

  private prepareProductPayload(): Partial<IProduct> {
    const { mainMedia, ...payload } = this.editForm.getRawValue();
    return { ...payload, currency: 'XOF' } as Partial<IProduct>;
  }

  private hasFilesToUpload(): boolean {
    return this.selectedMainFile?.isMarkedAsMain === true || this.selectedGalleryFiles().some(f => f.file?.isMarkedAsMain === true);
  }

  private saveWithMultipart(payload: Partial<IProduct>): void {
    const formData = this.buildMultipartFormData(payload);
    this.productService
      .createWithMedia(formData)
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: product => this.onSaveSuccess(product),
        error: err => this.onSaveError(err),
      });
  }

  private buildMultipartFormData(payload: Partial<IProduct>): FormData {
    const formData = new FormData();
    formData.append('product', new Blob([JSON.stringify(payload)], { type: 'application/json' }));
    if (this.selectedMainFile?.isMarkedAsMain === true) {
      formData.append('mainFile', this.selectedMainFile, this.selectedMainFile.name);
    }
    this.selectedGalleryFiles()
      .filter(item => item.file?.isMarkedAsMain !== true && item.isNew)
      .filter(item => {
        if (!this.selectedMainFile || !item.file) return true;
        return !(item.file.name === this.selectedMainFile.name && item.file.size === this.selectedMainFile.size);
      })
      .forEach(item => {
        if (item.file) formData.append('galleryFiles', item.file, item.file.name);
      });
    return formData;
  }

  private saveWithJson(payload: Partial<IProduct>): void {
    const product = payload as IProduct;
    const obs: Observable<IProduct> = product.id
      ? this.productService.update(product)
      : this.productService.create(product as unknown as NewProduct);
    obs.pipe(finalize(() => this.isSaving.set(false))).subscribe({
      next: product => this.onSaveSuccess(product),
      error: err => this.onSaveError(err),
    });
  }

  protected onSaveSuccess(product?: IProduct): void {
    this.clearAllFiles();
    this.router.navigate(['/products', product?.id ?? this.product?.id]);
  }

  protected onSaveError(error?: any): void {
    const message = error?.error?.message || error?.error?.fieldErrors?.[0]?.message || 'Échec de la sauvegarde';
    this.uploadError.set(message);
  }

  previousState(): void {
    globalThis.history.back();
  }

  isImageFile(file: FileWithPreview | null): boolean {
    return file?.type?.startsWith('image/') ?? false;
  }

  isVideoFile(file: FileWithPreview | null): boolean {
    return file?.type?.startsWith('video/') ?? false;
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  getFileExtension(file: FileWithPreview | null): string {
    if (!file) return '';
    const parts = file.type.split('/');
    return parts.length > 1 ? parts[1].toUpperCase() : '';
  }

  compareMedia = (o1: IMedia | null, o2: IMedia | null): boolean => this.mediaService.compareMedia(o1, o2);

  get totalFilesCount(): number {
    return (this.selectedMainFile ? 1 : 0) + this.selectedGalleryFiles().length;
  }

  getGalleryDots(): number[] {
    const total = this.totalFilesCount;
    return total > 1
      ? Array(total)
          .fill(0)
          .map((_, i) => i)
      : [];
  }

  calculateMarginPercent(): number {
    const { price, cost } = this.previewData();
    return price > 0 ? Math.round(((price - cost) / price) * 100) : 0;
  }

  calculateMarginValue(): number {
    const { price, cost } = this.previewData();
    return price - cost;
  }
}
