import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderValidation } from './order-validation';

describe('OrderValidation', () => {
  let component: OrderValidation;
  let fixture: ComponentFixture<OrderValidation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderValidation],
    }).compileComponents();

    fixture = TestBed.createComponent(OrderValidation);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
