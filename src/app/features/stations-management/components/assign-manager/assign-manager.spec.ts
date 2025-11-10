import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignManager } from './assign-manager';

describe('AssignManager', () => {
  let component: AssignManager;
  let fixture: ComponentFixture<AssignManager>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AssignManager]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignManager);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
