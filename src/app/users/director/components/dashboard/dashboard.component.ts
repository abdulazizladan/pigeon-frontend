import { Component, inject, OnInit } from '@angular/core';
import { DirectorStore } from '../../store/director.store';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit{

  public directorStore = inject(DirectorStore)

  ngOnInit() {
    this.directorStore.loadSummary()
  }
}
