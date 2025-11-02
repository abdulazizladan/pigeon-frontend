import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyStation } from './my-station';

describe('MyStation', () => {
  let component: MyStation;
  let fixture: ComponentFixture<MyStation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MyStation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyStation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
