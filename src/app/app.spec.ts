import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, it, expect, vi } from 'vitest';
import { provideRouter, RouterModule } from '@angular/router';
import { App } from './app';
import { ThemeService } from './theme.service';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterModule],
      declarations: [App],
      providers: [
        provideRouter([]),
        { provide: ThemeService, useValue: { initialize: vi.fn(), toggleTheme: vi.fn() } },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should initialize the theme on startup', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const theme = TestBed.inject(ThemeService);
    expect(theme.initialize).toHaveBeenCalledTimes(1);
  });

  it('should render the router outlet', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('router-outlet')).not.toBeNull();
  });
});
