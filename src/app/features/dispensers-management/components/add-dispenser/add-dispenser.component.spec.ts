import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddDispenserComponent } from './add-dispenser.component';

describe('AddDispenserComponent', () => {
  let component: AddDispenserComponent;
  let fixture: ComponentFixture<AddDispenserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddDispenserComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddDispenserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
