import { Component, effect, inject, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ManagersStore } from '../../store/manager.store';
import { MatDialog } from '@angular/material/dialog';
import { AddManagerComponent } from '../add-manager/add-manager.component';
import { Manager } from '../../models/manager.model';

@Component({
  selector: 'app-managers-list',
  standalone: false,
  templateUrl: './managers-list.component.html',
  styleUrl: './managers-list.component.scss'
})
export class ManagersListComponent implements OnInit{

  public managersStore = inject(ManagersStore);
  private dialog = inject(MatDialog)
  
  public dataSource = new MatTableDataSource<Manager>([])
  
  public displayedColumns: string[] = ["name", "email", "station", "status"]

    // ViewChilds for MatTable features
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private stationsEffect = effect(() => {
    const stations = this.managersStore.managers();
    this.dataSource = new MatTableDataSource(stations ?? []);
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
    this.dataSource.filterPredicate = (data: Manager, filter: string): boolean => {
      const dataStr = (data.info.firstName + data.info.lastName + data.email ).toLowerCase();
      return dataStr.indexOf(filter) !== -1;
    };
  });

  

  ngOnInit(): void {
    this.managersStore.loadManagers()
  }

  public applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  openAddManagerDialog() {
    const dialogRef = this.dialog.open(AddManagerComponent, {});
    dialogRef.afterClosed().subscribe(
      result => {
        if(result) {
          this.managersStore.addManager(result)
        }
      }
    )
  }


}
