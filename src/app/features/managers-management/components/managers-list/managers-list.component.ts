import { Component, inject, OnInit } from '@angular/core';
import { ManagersStore } from '../../store/manager.store';
import { MatDialog } from '@angular/material/dialog';
import { AddManagerComponent } from '../add-manager/add-manager.component';

@Component({
  selector: 'app-managers-list',
  standalone: false,
  templateUrl: './managers-list.component.html',
  styleUrl: './managers-list.component.scss'
})
export class ManagersListComponent implements OnInit{

  public managersStore = inject(ManagersStore);
  private dialog = inject(MatDialog)
  public displayedColumns: string[] = ["name", "email", "station", "status"]

  openAddManagerDialog() {
    const dialogRef = this.dialog.open(AddManagerComponent)
  }

  ngOnInit(): void {
    this.managersStore.loadManagers()
  }
}
