import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeativateUserDialogComponent } from './deativate-user-dialog.component';

describe('DeativateUserDialogComponent', () => {
  let component: DeativateUserDialogComponent;
  let fixture: ComponentFixture<DeativateUserDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DeativateUserDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeativateUserDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
