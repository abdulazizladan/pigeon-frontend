import { Component, OnInit, inject } from '@angular/core';
import { AdminStore } from '../../store/admin.store';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  public adminStore = inject(AdminStore);

  ngOnInit() {
    this.adminStore.loadSummary();
  }
}
