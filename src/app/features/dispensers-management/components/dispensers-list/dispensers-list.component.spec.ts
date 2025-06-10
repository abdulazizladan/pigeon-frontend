import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DispensersListComponent } from './dispensers-list.component';

describe('DispensersListComponent', () => {
  let component: DispensersListComponent;
  let fixture: ComponentFixture<DispensersListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DispensersListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DispensersListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
