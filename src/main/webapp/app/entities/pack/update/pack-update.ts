import { Component, OnInit, inject, signal, ViewChild, ElementRef, computed, effect } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, finalize, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { CommonModule, DecimalPipe } from '@angular/common';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslateModule } from '@ngx-translate/core';

import { IMedia } from 'app/entities/media/media.model';
import { MediaService } from 'app/entities/media/service/media.service';
import { IProduct } from 'app/entities/product/product.model';
import { ProductService } from 'app/entities/product/service/product.service';
import { IPack, NewPack } from '../pack.model';
import { PackService } from '../service/pack.service';
import { PackFormGroup, PackFormService } from './pack-form.service';

import dayjs from 'dayjs/esm';

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

interface PackItem {
  id: number;
  product: IProduct;
  quantity: number;
}

@Component({
  selector: 'jhi-pack-update',
  templateUrl: './pack-update.html',
  styleUrl: './pack-update.css',
  imports: [CommonModule, TranslateModule, FontAwesomeModule, ReactiveFormsModule, DecimalPipe],
})
export class PackUpdate implements OnInit {
  readonly isSaving = signal(false);
  readonly uploadError = signal<string | null>(null);
  readonly saveMode = signal<'create' | 'update'>('create');
  readonly qualityWarning = signal<string | null>(null);
  readonly qualityScore = signal<number | null>(null);
  readonly dragOver = signal(false);

  // Media
  selectedMainFile: FileWithPreview | null = null;
  selectedGalleryFiles = signal<GalleryItem[]>([]);
  readonly isMainFileSet = signal(false);

  // Pack items
  readonly packItems = signal<PackItem[]>([]);
  readonly searchResults = signal<IProduct[]>([]);
  readonly searchQuery = signal('');

  // Preview
  readonly currentPreviewIndex = signal(0);
  readonly previewData = computed(() => {
    const items = this.packItems();
    const originalPrice = items.reduce((sum, item) => sum + (item.product.price ?? 0) * item.quantity, 0);
    const discountType = this.editForm?.controls?.discountType?.value ?? 'PERCENT';
    const discountValue = Number(this.editForm?.controls?.discountValue?.value ?? 0);

    let discountAmount = 0;
    if (discountType === 'PERCENT') {
      discountAmount = Math.round(originalPrice * (discountValue / 100));
    } else {
      discountAmount = discountValue;
    }

    const finalPrice = Math.max(0, originalPrice - discountAmount);

    return {
      name: this.editForm?.controls?.name?.value ?? '',
      description: this.editForm?.controls?.description?.value ?? '',
      originalPrice,
      discountAmount,
      finalPrice,
    };
  });

  readonly previewImages = computed(() => {
    const images: string[] = [];
    if (this.selectedMainFile?.previewUrl) {
      images.push(this.selectedMainFile.previewUrl);
    }
    this.selectedGalleryFiles().forEach(item => {
      if (item.previewUrl) images.push(item.previewUrl);
    });
    // Fallback: use first product image
    if (images.length === 0 && this.packItems().length > 0) {
      const firstProduct = this.packItems()[0].product;
      if (firstProduct.mainMedia?.url) {
        images.push(this.getMediaUrl(firstProduct.mainMedia.url));
      }
    }
    return images;
  });

  readonly currentPreviewImage = computed(() => {
    const images = this.previewImages();
    if (images.length === 0) return null;
    return images[this.currentPreviewIndex() % images.length];
  });

  readonly previewDiscountPercent = computed(() => {
    const data = this.previewData();
    if (data.originalPrice === 0) return 0;
    return Math.round((data.discountAmount / data.originalPrice) * 100);
  });

  product: IPack | null = null;
  editForm: PackFormGroup;

  private readonly MAX_IMAGE_SIZE = 2 * 1024 * 1024;
  private readonly MAX_VIDEO_SIZE = 10 * 1024 * 1024;
  private readonly ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  private readonly ALLOWED_VIDEO_TYPES = ['video/mp4'];
  private nextItemId = 1;

  @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;
  protected readonly fb = inject(FormBuilder);
  protected readonly packService = inject(PackService);
  protected readonly packFormService = inject(PackFormService);
  protected readonly mediaService = inject(MediaService);
  protected readonly productService = inject(ProductService);
  protected readonly activatedRoute = inject(ActivatedRoute);
  protected readonly router = inject(Router);

  constructor() {
    this.editForm = this.packFormService.createPackFormGroup();

    // Auto-update quality score when form or media changes
    effect(() => {
      this.editForm.value; // track
      this.selectedMainFile; // track
      this.selectedGalleryFiles(); // track
      this.packItems(); // track
      this.calculateQualityScore();
    });
  }

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ pack }) => {
      this.product = pack;
      this.saveMode.set(pack?.id ? 'update' : 'create');
      if (pack) {
        this.updateForm(pack);
      }
    });
  }

  protected updateForm(pack: IPack): void {
    this.product = pack;
    this.packFormService.resetForm(this.editForm, pack);

    // Load existing media
    if (pack.mainMedia?.id && pack.mainMedia?.id) {
      this.selectedMainFile = {
        name: this.extractFilenameFromUrl(pack.mainMedia?.url ?? ''),
        previewUrl: pack.mainMedia.url,
        isMarkedAsMain: true,
        type: 'image/jpeg',
        size: pack.mainMedia.sizeBytes || 0,
      } as FileWithPreview;
      this.isMainFileSet.set(true);
    }

    if (pack.galleries?.length) {
      const existingGallery = pack.galleries.map((media, index) => ({
        media,
        id: media.id ?? index,
        previewUrl: media.url || '',
        isNew: false,
      }));
      this.selectedGalleryFiles.set(existingGallery);
    }

    // Load existing pack items
    if (pack.packItems?.length) {
      const items = pack.packItems.map((pi, index) => ({
        id: pi.id ?? index,
        product: pi.product!,
        quantity: pi.quantity ?? 1,
      }));
      this.packItems.set(items);
    }
  }

  private extractFilenameFromUrl(url: string): string {
    if (!url) return 'image.jpg';
    const parts = url.split('/');
    return parts[parts.length - 1] || 'image.jpg';
  }

  // === QUALITY SCORE ===

  private calculateQualityScore(): void {
    let score = 0;
    const hasMainImage = !!this.selectedMainFile || !!this.product?.mainMedia;
    const hasGallery = this.selectedGalleryFiles().length > 0 || (this.product?.galleries?.length ?? 0) > 0;
    const hasProducts = this.packItems().length > 0;
    const hasDescription = !!this.editForm.controls.description?.value;
    const hasDiscount = Number(this.editForm.controls.discountValue?.value) > 0;
    const isActive = this.editForm.controls.isActive?.value;

    if (hasMainImage) score += 30;
    if (hasGallery) score += 20;
    if (hasProducts) score += 20;
    if (hasDescription) score += 10;
    if (hasDiscount) score += 10;
    if (isActive) score += 10;

    this.qualityScore.set(score);

    // Warning for packs without dedicated image
    if (!hasMainImage && hasProducts && this.saveMode() === 'create') {
      this.qualityWarning.set("Ajoutez une image pack pour plus d'impact. Le système utilisera l'image du produit le plus cher.");
    } else {
      this.qualityWarning.set(null);
    }
  }

  // === FILE UPLOAD ===

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
      if (file.size > this.MAX_VIDEO_SIZE) return 'Vidéo trop lourde (max 10Mo)';
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
  }

  removeMainImage(): void {
    this.selectedMainFile = null;
    this.isMainFileSet.set(false);
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

  // === PACK ITEMS ===

  searchProducts(event: Event): void {
    const query = (event.target as HTMLInputElement).value;
    this.searchQuery.set(query);

    if (query.length < 2) {
      this.searchResults.set([]);
      return;
    }

    this.productService
      .query({
        search: query,
        size: 10,
      })
      .subscribe({
        next: res => {
          const existingIds = new Set(this.packItems().map(item => item.product.id));
          const filtered = (res.body || []).filter(p => !existingIds.has(p.id));
          this.searchResults.set(filtered);
        },
        error: () => this.searchResults.set([]),
      });
  }

  addPackItem(product: IProduct): void {
    this.packItems.update(items => [...items, { id: this.nextItemId++, product, quantity: 1 }]);
    this.searchResults.set([]);
    this.searchQuery.set('');
  }

  removePackItem(index: number): void {
    this.packItems.update(items => {
      const newItems = [...items];
      newItems.splice(index, 1);
      return newItems;
    });
  }

  incrementQuantity(item: PackItem): void {
    this.packItems.update(items => items.map(i => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)));
  }

  decrementQuantity(item: PackItem): void {
    if (item.quantity <= 1) return;
    this.packItems.update(items => items.map(i => (i.id === item.id ? { ...i, quantity: i.quantity - 1 } : i)));
  }

  // === PREVIEW ===

  setPreviewIndex(index: number): void {
    this.currentPreviewIndex.set(index);
  }

  // === SAVE ===

  private validateBeforeSave(): string | null {
    if (!this.editForm.valid) return 'Veuillez remplir tous les champs obligatoires';
    if (this.packItems().length === 0) return 'Ajoutez au moins un produit au pack';
    return null;
  }
  private preparePackPayload(): Partial<IPack> {
    const { mainMedia, ...payload } = this.editForm.getRawValue();

    const formatDateToInstant = (date: any): dayjs.Dayjs | null => {
      if (!date) return null;
      if (dayjs.isDayjs(date)) return date;
      if (typeof date === 'string') {
        return dayjs(date);
      }
      if (date instanceof Date) {
        return dayjs(date);
      }
      return null;
    };

    const galleryToKeep = this.selectedGalleryFiles()
      .filter(item => !item.isNew && item.media?.id)
      .map(item => ({ id: item.media!.id }));

    const packItemsData = this.packItems().map(item => ({
      id: item.id && item.id > 1000000 ? null : item.id,
      product: { id: item.product.id },
      quantity: item.quantity,
    }));

    return {
      ...payload,
      startDate: formatDateToInstant(payload.startDate),
      endDate: formatDateToInstant(payload.endDate),
      discountValue: payload.discountValue?.toString() ?? null,
      galleries: galleryToKeep,
      packItems: packItemsData,
    } as Partial<IPack>;
  }

  public save(): void {
    const error = this.validateBeforeSave();
    if (error) {
      this.uploadError.set(error);
      return;
    }

    this.isSaving.set(true);
    this.uploadError.set(null);

    const payload = this.preparePackPayload();

    // Vérifier s'il y a des NOUVEAUX fichiers à uploader
    const hasNewMainFile = this.selectedMainFile instanceof File;
    const hasNewGalleryFiles = this.selectedGalleryFiles().some(f => f.isNew && f.file instanceof File);
    const hasFilesToUpload = hasNewMainFile || hasNewGalleryFiles;

    if (this.saveMode() === 'create') {
      if (hasFilesToUpload) {
        this.saveWithMultipart(payload);
      } else {
        this.saveWithJson(payload);
      }
    } else {
      if (hasFilesToUpload) {
        this.updateWithMultipart(payload);
      } else {
        this.updateWithJson(payload);
      }
    }
  }
  private updateWithJson(payload: Partial<IPack>): void {
    const pack = { ...payload, id: this.product?.id } as IPack;

    // Ne pas inclure les médias vides
    const updateData: any = {
      id: pack.id,
      name: pack.name,
      description: pack.description,
      startDate: pack.startDate,
      endDate: pack.endDate,
      discountType: pack.discountType,
      discountValue: pack.discountValue,
      isActive: pack.isActive,
      displayOnHomepage: pack.displayOnHomepage,
      packItems: pack.packItems,
    };

    // Inclure les médias EXISTANTS seulement
    if (this.product?.mainMedia) {
      updateData.mainMedia = { id: this.product.mainMedia.id };
    }

    const existingGalleries = this.selectedGalleryFiles()
      .filter(item => !item.isNew && item.media?.id)
      .map(item => ({ id: item.media!.id }));

    if (existingGalleries.length > 0) {
      updateData.galleries = existingGalleries;
    }

    this.packService
      .update(updateData)
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: pack => this.onSaveSuccess(pack),
        error: err => this.onSaveError(err),
      });
  }

  private updateWithMultipart(payload: Partial<IPack>): void {
    const id = this.product?.id;
    if (!id) {
      this.onSaveError('Pack ID is required for update');
      return;
    }

    // Ajouter l'ID au payload
    payload.id = id;

    const formData = this.buildMultipartFormData(payload);

    // Vérifier si le FormData a des fichiers à envoyer
    let hasFiles = false;
    for (const pair of (formData as any).entries()) {
      if (pair[1] instanceof File) {
        hasFiles = true;
        break;
      }
    }

    if (!hasFiles) {
      // Si pas de fichiers, utiliser la méthode JSON
      this.updateWithJson(payload);
      return;
    }

    this.packService
      .updateWithMedia(id, formData)
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: pack => this.onSaveSuccess(pack),
        error: err => this.onSaveError(err),
      });
  }
  // Dans la méthode buildMultipartFormData
  private buildMultipartFormData(payload: Partial<IPack>): FormData {
    const formData = new FormData();

    // S'assurer que l'ID est présent pour les mises à jour
    if (this.saveMode() === 'update' && this.product?.id) {
      payload.id = this.product.id;
    }

    // Pour la mise à jour, inclure les médias existants
    if (this.product?.mainMedia && !this.selectedMainFile) {
      payload.mainMedia = { id: this.product.mainMedia.id };
    }

    if (this.selectedGalleryFiles().some(item => !item.isNew && item.media?.id)) {
      payload.galleries = this.selectedGalleryFiles()
        .filter(item => !item.isNew && item.media?.id)
        .map(item => ({ id: item.media!.id }));
    }

    // Convertir les dates correctement
    if (payload.startDate) {
      payload.startDate = dayjs(payload.startDate) as any;
    }
    if (payload.endDate) {
      payload.endDate = dayjs(payload.endDate) as any;
    }

    // Nettoyer les champs undefined/null
    const cleanPayload = Object.fromEntries(Object.entries(payload).filter(([_, v]) => v !== undefined && v !== null));

    formData.append('pack', JSON.stringify(cleanPayload));

    // N'AJOUTER QUE si un nouveau fichier est sélectionné
    if (this.selectedMainFile && this.selectedMainFile instanceof File) {
      formData.append('mainFile', this.selectedMainFile, this.selectedMainFile.name);
    }

    // N'AJOUTER QUE les nouveaux fichiers de gallery
    const newGalleryFiles = this.selectedGalleryFiles().filter(item => item.isNew && item.file instanceof File);

    newGalleryFiles.forEach(item => {
      if (item.file instanceof File) {
        formData.append('galleryFiles', item.file, item.file.name);
      }
    });

    return formData;
  }

  // Ajouter cette méthode helper pour les dates
  private formatDateToISO(date: any): string {
    if (!date) return '';
    if (typeof date === 'string' && date.includes('T')) return date;
    const d = date instanceof Date ? date : new Date(date);
    return d.toISOString();
  }
  private saveWithMultipart(payload: Partial<IPack>): void {
    const formData = this.buildMultipartFormData(payload);
    this.packService
      .createWithMedia(formData)
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: pack => this.onSaveSuccess(pack),
        error: err => this.onSaveError(err),
      });
  }

  private saveWithJson(payload: Partial<IPack>): void {
    const pack = payload as IPack;
    this.packService
      .create(pack as unknown as NewPack)
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: pack => this.onSaveSuccess(pack),
        error: err => this.onSaveError(err),
      });
  }

  protected onSaveSuccess(pack?: IPack): void {
    this.clearAllFiles();
    this.router.navigate(['/pack']);
  }

  protected onSaveError(error?: any): void {
    const message = error?.error?.message || error?.error?.fieldErrors?.[0]?.message || 'Échec de la sauvegarde';
    this.uploadError.set(message);
  }

  previousState(): void {
    globalThis.history.back();
  }

  // === HELPERS ===

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

  getMediaUrl(url: string | null | undefined): string {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `http://localhost:8080${url}`;
  }

  get totalFilesCount(): number {
    return (this.selectedMainFile ? 1 : 0) + this.selectedGalleryFiles().length;
  }
}
