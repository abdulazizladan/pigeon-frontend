import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, beforeEach, it, expect } from 'vitest';
import { signal } from '@angular/core';
import { provideRouter, RouterModule } from '@angular/router';
import { Layout } from './layout';
import { AdminNavbarComponent } from '../navbar/navbar';
import { AuthStore } from '../../../../auth/store/auth.store';

describe('Layout', () => {
  let component: Layout;
  let fixture: ComponentFixture<Layout>;

  beforeEach(async () => {
    const mockAuthStore = {
      user: signal({ id: '1', username: 'admin', role: 'admin' }),
      userInitial: signal('A'),
      logout: () => {},
    };

    await TestBed.configureTestingModule({
      declarations: [Layout, AdminNavbarComponent],
      imports: [RouterModule],
      providers: [provideRouter([]), { provide: AuthStore, useValue: mockAuthStore }],
    }).compileComponents();

    fixture = TestBed.createComponent(Layout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
