import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnableUser } from './enable-user';

describe('EnableUser', () => {
  let component: EnableUser;
  let fixture: ComponentFixture<EnableUser>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EnableUser]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EnableUser);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
