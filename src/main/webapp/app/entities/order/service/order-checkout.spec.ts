import { TestBed } from '@angular/core/testing';

import { OrderCheckoutService } from './order-checkout';

describe('OrderCheckoutService', () => {
  let service: OrderCheckoutService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrderCheckoutService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
