import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnassignManager } from './unassign-manager';

describe('UnassignManager', () => {
  let component: UnassignManager;
  let fixture: ComponentFixture<UnassignManager>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UnassignManager]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UnassignManager);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
