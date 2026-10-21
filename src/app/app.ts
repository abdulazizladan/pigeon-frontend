import { Component, inject, OnInit, signal } from '@angular/core';
import { ThemeService } from './theme.service';
import { AuthStore } from './auth/store/auth.store';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.css',
})
export class App implements OnInit {
  protected readonly title = signal('pigeon');
  readonly themeService = inject(ThemeService);
  protected readonly auth = inject(AuthStore);

  ngOnInit() {
    this.themeService.initialize();
  }
}
