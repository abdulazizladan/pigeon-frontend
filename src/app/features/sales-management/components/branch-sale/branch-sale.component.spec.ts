import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BranchSaleComponent } from './branch-sale.component';

describe('BranchSaleComponent', () => {
  let component: BranchSaleComponent;
  let fixture: ComponentFixture<BranchSaleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BranchSaleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BranchSaleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
