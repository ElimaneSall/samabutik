import { HttpResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal, ViewChild, ElementRef } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
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

// ============================================================================
// TYPES PERSONNALISÉS
// ============================================================================

interface FileWithPreview extends File {
  previewUrl?: string;
  isMarkedAsMain?: boolean;
}

interface GalleryItem {
  file: FileWithPreview;
  id: number;
  previewUrl: string;
}

type ProductSaveMode = 'create' | 'update';

// ============================================================================
// COMPOSANT
// ============================================================================

@Component({
  selector: 'jhi-product-update',
  templateUrl: './product-update.html',
  styleUrl: './product-update.css',
  imports: [CommonModule, TranslateDirective, TranslateModule, FontAwesomeModule, ReactiveFormsModule],
})
export class ProductUpdate implements OnInit {
  // ─── État général ──────────────────────────────────────────────────────
  readonly isSaving = signal(false);
  readonly uploadError = signal<string | null>(null);
  readonly saveMode = signal<ProductSaveMode>('create');
  readonly previewData = signal({
    name: 'Riz Brisé 5kg',
    sku: 'RIZ-5KG-001',
    price: 3500,
    cost: 2800,
  });

  product: IProduct | null = null;
  editForm: ProductFormGroup;

  // ─── Gestion des fichiers ──────────────────────────────────────────────
  selectedMainFile: FileWithPreview | null = null;
  selectedGalleryFiles: GalleryItem[] = [];
  readonly isMainFileSet = signal(false);
  readonly dragOver = signal(false);

  // ─── Collections pour les relations ────────────────────────────────────
  readonly mainMediasCollection = signal<IMedia[]>([]);

  // ─── Règles de validation upload ───────────────────────────────────────
  private readonly MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB
  private readonly MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
  private readonly ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  private readonly ALLOWED_VIDEO_TYPES = ['video/mp4'];

  // ─── Références DOM pour drag & drop ───────────────────────────────────
  @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;

  // ─── Injection des dépendances ─────────────────────────────────────────
  protected readonly fb = inject(FormBuilder);
  protected readonly productService = inject(ProductService);
  protected readonly productFormService = inject(ProductFormService);
  protected readonly mediaService = inject(MediaService);
  protected readonly activatedRoute = inject(ActivatedRoute);
  protected readonly router = inject(Router);

  constructor() {
    this.editForm = this.productFormService.createProductFormGroup();

    // Subscribe to form changes for live preview
    this.editForm.valueChanges.subscribe(values => {
      this.previewData.update(data => ({
        ...data,
        name: values.name || data.name,
        sku: values.sku || data.sku,
        price: values.price || data.price,
        cost: values.costPrice || data.cost,
      }));
      this.updateMarginPreview();
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
    });
  }

  protected updateForm(product: IProduct): void {
    this.product = product;
    this.productFormService.resetForm(this.editForm, product);
    this.mainMediasCollection.set(this.mediaService.addMediaToCollectionIfMissing<IMedia>(this.mainMediasCollection(), product.mainMedia));
  }

  protected loadRelationshipsOptions(): void {
    if (this.saveMode() === 'update') {
      this.mediaService
        .query({ filter: 'productmain-is-null' })
        .pipe(
          map((res: HttpResponse<IMedia[]>) => res.body ?? []),
          map((medias: IMedia[]) => this.mediaService.addMediaToCollectionIfMissing<IMedia>(medias, this.product?.mainMedia)),
        )
        .subscribe((medias: IMedia[]) => this.mainMediasCollection.set(medias));
    }
  }

  // ─── Gestion des fichiers ──────────────────────────────────────────────
  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (!files?.length) return;

    Array.from(files).forEach(file => {
      const validationError = this.validateFile(file);
      if (validationError) {
        this.uploadError.set(validationError);
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
    this.updateSummary();
  }

  private validateFile(file: File): string | null {
    if (file.size === 0) return 'Fichier vide';

    if (file.type.startsWith('image/')) {
      if (!this.ALLOWED_IMAGE_TYPES.includes(file.type)) {
        return 'Format image non supporté (JPG/PNG/WEBP uniquement)';
      }
      if (file.size > this.MAX_IMAGE_SIZE) {
        return `Image trop lourde (max 2Mo): ${file.name}`;
      }
    } else if (file.type.startsWith('video/')) {
      if (!this.ALLOWED_VIDEO_TYPES.includes(file.type)) {
        return 'Format vidéo non supporté (MP4 uniquement)';
      }
      if (file.size > this.MAX_VIDEO_SIZE) {
        return `Vidéo trop lourde (max 50Mo): ${file.name}`;
      }
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
      reader.onload = (e: ProgressEvent<FileReader>) => {
        resolve((e.target?.result as string) || '/content/images/video-placeholder.png');
      };
      reader.onerror = () => resolve('/content/images/video-placeholder.png');
      reader.readAsDataURL(file);
    });
  }

  markAsMain(file: FileWithPreview, source: 'main' | 'gallery'): void {
    // Reset all main flags
    if (this.selectedMainFile) {
      this.selectedMainFile.isMarkedAsMain = false;
    }
    this.selectedGalleryFiles.forEach(f => (f.file.isMarkedAsMain = false));

    // Set new main flag
    if (source === 'main' && this.selectedMainFile) {
      this.selectedMainFile.isMarkedAsMain = true;
    } else if (source === 'gallery') {
      file.isMarkedAsMain = true;
    }

    this.isMainFileSet.set(
      this.selectedMainFile?.isMarkedAsMain === true || this.selectedGalleryFiles.some(f => f.file.isMarkedAsMain === true),
    );
    this.updateSummary();
  }

  addGalleryFile(file: FileWithPreview, previewUrl: string): void {
    const id = Date.now() + Math.random();
    this.selectedGalleryFiles.push({ file, id, previewUrl });
    this.updateSummary();
  }

  removeGalleryFile(index: number): void {
    this.selectedGalleryFiles.splice(index, 1);
    const hasMain = this.selectedMainFile?.isMarkedAsMain === true || this.selectedGalleryFiles.some(f => f.file.isMarkedAsMain === true);
    this.isMainFileSet.set(hasMain);
    this.updateSummary();
  }

  removeMainImage(): void {
    this.selectedMainFile = null;
    const hasMain = this.selectedGalleryFiles.some(f => f.file.isMarkedAsMain === true);
    this.isMainFileSet.set(hasMain);
    this.updateSummary();
  }

  clearAllFiles(): void {
    this.selectedMainFile = null;
    this.selectedGalleryFiles = [];
    this.isMainFileSet.set(false);
    this.uploadError.set(null);
    this.updateSummary();
  }

  // ─── Drag & Drop helpers ──────────────────────────────────────────────
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
    if (files?.length) {
      this.onFilesSelected({ target: { files } } as unknown as Event);
    }
  }

  triggerFileInput(): void {
    this.fileInput?.nativeElement.click();
  }

  // ─── Validation & Sauvegarde ───────────────────────────────────────────
  private validateBeforeSave(): string | null {
    if (!this.editForm.valid) {
      return 'Veuillez remplir tous les champs obligatoires';
    }
    const hasFiles = !!this.selectedMainFile || this.selectedGalleryFiles.length > 0;
    if (this.saveMode() === 'create' && !hasFiles) {
      return 'Veuillez ajouter au moins une image ou vidéo';
    }
    if (hasFiles && !this.isMainFileSet()) {
      return 'Veuillez sélectionner une image principale';
    }
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

    const productPayload = this.prepareProductPayload();

    if (this.saveMode() === 'create' && this.hasFilesToUpload()) {
      this.saveWithMultipart(productPayload);
    } else {
      this.saveWithJson(productPayload);
    }
  }

  private prepareProductPayload(): Partial<IProduct> {
    const formValue = this.editForm.getRawValue();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { mainMedia, ...payload } = formValue;
    return {
      ...payload,
      currency: 'XOF',
    } as Partial<IProduct>;
  }

  private hasFilesToUpload(): boolean {
    return this.selectedMainFile?.isMarkedAsMain === true || this.selectedGalleryFiles.some(f => f.file.isMarkedAsMain === true);
  }

  private saveWithMultipart(productPayload: Partial<IProduct>): void {
    const formData = this.buildMultipartFormData(productPayload);
    this.productService
      .createWithMedia(formData)
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: savedProduct => this.onSaveSuccess(savedProduct),
        error: err => this.onSaveError(err),
      });
  }

  private saveWithJson(productPayload: Partial<IProduct>): void {
    const product = productPayload as IProduct;
    const saveObservable: Observable<IProduct> = product.id
      ? this.productService.update(product)
      : this.productService.create(product as unknown as NewProduct);

    saveObservable.pipe(finalize(() => this.isSaving.set(false))).subscribe({
      next: savedProduct => this.onSaveSuccess(savedProduct),
      error: err => this.onSaveError(err),
    });
  }

  protected onSaveSuccess(savedProduct?: IProduct): void {
    this.clearAllFiles();
    this.router.navigate(['/products']);
  }

  protected onSaveError(error?: any): void {
    const message = error?.error?.message || error?.error?.fieldErrors?.[0]?.message || 'Échec de la sauvegarde';
    this.uploadError.set(message);
  }

  previousState(): void {
    globalThis.history.back();
  }

  // ─── Helpers UI ────────────────────────────────────────────────────────
  isImage(file: FileWithPreview | null): boolean {
    return file?.type?.startsWith('image/') ?? false;
  }

  isVideo(file: FileWithPreview | null): boolean {
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

  // ─── Live Preview helpers ─────────────────────────────────────────────
  updateMarginPreview(): void {
    const price = this.previewData().price;
    const cost = this.previewData().cost;
    const margin = price - cost;
    const percent = price > 0 ? Math.round((margin / price) * 100) : 0;
    // Tu peux stocker ça dans un signal si besoin pour l'affichage
  }

  updateSummary(): void {
    // Met à jour les compteurs dans le résumé (géré par signals/template)
  }

  // Getter pour le template
  get totalFilesCount(): number {
    return (this.selectedMainFile ? 1 : 0) + this.selectedGalleryFiles.length;
  }

  get galleryDots(): number[] {
    const total = this.totalFilesCount;
    return total > 1
      ? Array(total)
          .fill(0)
          .map((_, i) => i)
      : [];
  }
  getGalleryDots(): number[] {
    const total = this.totalFilesCount;
    return total > 1
      ? Array(total)
          .fill(0)
          .map((_, i) => i)
      : [];
  }

  // ✅ AJOUTE AUSSI CETTE MÉTHODE POUR LE POURCENTAGE
  calculateMarginPercent(): number {
    const price = this.previewData().price;
    const cost = this.previewData().cost;
    const margin = price - cost;
    return price > 0 ? Math.round((margin / price) * 100) : 0;
  }

  calculateMarginValue(): number {
    return this.previewData().price - this.previewData().cost;
  }
  // Dans la classe ProductUpdate de product-update.ts

  private buildMultipartFormData(productPayload: Partial<IProduct>): FormData {
    const formData = new FormData();

    // 1. Ajouter les données du produit en JSON
    formData.append(
      'product',
      new Blob([JSON.stringify(productPayload)], {
        type: 'application/json',
      }),
    );

    // 2. Ajouter le fichier principal SI marqué comme principal
    if (this.selectedMainFile?.isMarkedAsMain === true) {
      formData.append('mainFile', this.selectedMainFile, this.selectedMainFile.name);
    }

    this.selectedGalleryFiles
      .filter(item => item.file.isMarkedAsMain !== true) // Exclure si marqué comme main
      .filter(item => {
        if (this.selectedMainFile) {
          return !(item.file.name === this.selectedMainFile.name && item.file.size === this.selectedMainFile.size);
        }
        return true;
      })
      .forEach(item => {
        formData.append('galleryFiles', item.file, item.file.name);
      });

    return formData;
  }
}
