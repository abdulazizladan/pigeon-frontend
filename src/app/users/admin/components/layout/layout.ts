import { Component, inject } from '@angular/core';
import { AdminLayoutStore } from '../../store/admin-layout.store';

@Component({
  selector: 'app-layout',
  standalone: false,
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout {
  protected readonly layout = inject(AdminLayoutStore);
  protected readonly isSidebarOpen = this.layout.isSidebarOpen;
}
