import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly theme = signal<'light' | 'dark'>('light');

  initialize() {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      this.applyTheme(savedTheme);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.applyTheme(prefersDark ? 'dark' : 'light');
    }

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) {
        this.applyTheme(e.matches ? 'dark' : 'light');
      }
    });
  }

  toggleTheme() {
    const nextTheme = this.theme() === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', nextTheme);
    this.applyTheme(nextTheme);
  }

  private applyTheme(newTheme: 'light' | 'dark') {
    this.theme.set(newTheme);
    const htmlEl = document.documentElement;
    htmlEl.classList.toggle('dark', newTheme === 'dark');
    htmlEl.classList.toggle('light', newTheme === 'light');
  }
}
