import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DispenserDetailsComponent } from './dispenser-details.component';

describe('DispenserDetailsComponent', () => {
  let component: DispenserDetailsComponent;
  let fixture: ComponentFixture<DispenserDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DispenserDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DispenserDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
