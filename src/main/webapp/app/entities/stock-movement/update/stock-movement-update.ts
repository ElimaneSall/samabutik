import { HttpResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import { StockReason } from 'app/entities/enumerations/stock-reason.model';
import { IProduct } from 'app/entities/product/product.model';
import { ProductService } from 'app/entities/product/service/product.service';
import { UserStaffService } from 'app/entities/user-staff/service/user-staff.service';
import { IUserStaff } from 'app/entities/user-staff/user-staff.model';
import { AlertError } from 'app/shared/alert/alert-error';
import { TranslateDirective } from 'app/shared/language';
import { StockMovementService } from '../service/stock-movement.service';
import { IStockMovement } from '../stock-movement.model';

import { StockMovementFormGroup, StockMovementFormService } from './stock-movement-form.service';

@Component({
  selector: 'jhi-stock-movement-update',
  templateUrl: './stock-movement-update.html',
  imports: [TranslateDirective, TranslateModule, FontAwesomeModule, AlertError, ReactiveFormsModule],
})
export class StockMovementUpdate implements OnInit {
  readonly isSaving = signal(false);
  stockMovement: IStockMovement | null = null;
  stockReasonValues = Object.keys(StockReason);

  performedBiesCollection = signal<IUserStaff[]>([]);
  productsSharedCollection = signal<IProduct[]>([]);

  protected stockMovementService = inject(StockMovementService);
  protected stockMovementFormService = inject(StockMovementFormService);
  protected userStaffService = inject(UserStaffService);
  protected productService = inject(ProductService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: StockMovementFormGroup = this.stockMovementFormService.createStockMovementFormGroup();

  compareUserStaff = (o1: IUserStaff | null, o2: IUserStaff | null): boolean => this.userStaffService.compareUserStaff(o1, o2);

  compareProduct = (o1: IProduct | null, o2: IProduct | null): boolean => this.productService.compareProduct(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ stockMovement }) => {
      this.stockMovement = stockMovement;
      if (stockMovement) {
        this.updateForm(stockMovement);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    globalThis.history.back();
  }

  save(): void {
    this.isSaving.set(true);
    const stockMovement = this.stockMovementFormService.getStockMovement(this.editForm);
    if (stockMovement.id === null) {
      this.subscribeToSaveResponse(this.stockMovementService.create(stockMovement));
    } else {
      this.subscribeToSaveResponse(this.stockMovementService.update(stockMovement));
    }
  }

  protected subscribeToSaveResponse(result: Observable<IStockMovement | null>): void {
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

  protected updateForm(stockMovement: IStockMovement): void {
    this.stockMovement = stockMovement;
    this.stockMovementFormService.resetForm(this.editForm, stockMovement);

    this.performedBiesCollection.set(
      this.userStaffService.addUserStaffToCollectionIfMissing<IUserStaff>(this.performedBiesCollection(), stockMovement.performedBy),
    );
    this.productsSharedCollection.update(products =>
      this.productService.addProductToCollectionIfMissing<IProduct>(products, stockMovement.product),
    );
  }

  protected loadRelationshipsOptions(): void {
    this.userStaffService
      .query({ filter: 'stockmovement-is-null' })
      .pipe(map((res: HttpResponse<IUserStaff[]>) => res.body ?? []))
      .pipe(
        map((userStaffs: IUserStaff[]) =>
          this.userStaffService.addUserStaffToCollectionIfMissing<IUserStaff>(userStaffs, this.stockMovement?.performedBy),
        ),
      )
      .subscribe((userStaffs: IUserStaff[]) => this.performedBiesCollection.set(userStaffs));

    this.productService
      .query()
      .pipe(map((res: HttpResponse<IProduct[]>) => res.body ?? []))
      .pipe(
        map((products: IProduct[]) => this.productService.addProductToCollectionIfMissing<IProduct>(products, this.stockMovement?.product)),
      )
      .subscribe((products: IProduct[]) => this.productsSharedCollection.set(products));
  }
}
