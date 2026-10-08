import { Component, inject, OnInit, signal } from '@angular/core';
import { ThemeService } from './theme.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.css',
})
export class App implements OnInit {
  protected readonly title = signal('pigeon');
  readonly themeService = inject(ThemeService);

  ngOnInit() {
    this.themeService.initialize();
  }
}
