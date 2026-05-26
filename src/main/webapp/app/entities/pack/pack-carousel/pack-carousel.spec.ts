import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PackCarousel } from './pack-carousel';

describe('PackCarousel', () => {
  let component: PackCarousel;
  let fixture: ComponentFixture<PackCarousel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PackCarousel],
    }).compileComponents();

    fixture = TestBed.createComponent(PackCarousel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
