import { Component, OnInit, inject, computed, effect, ViewChild, AfterViewInit } from '@angular/core';
import { AdminStore } from '../../store/admin.store';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, AfterViewInit {
  public adminStore = inject(AdminStore);

  public dataSource = new MatTableDataSource<any>([]);
  public displayedColumns: string[] = [];
  public columnNames: string[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor() {
    effect(() => {
      const logs = this.adminStore.activityLogs();
      if (logs && logs.length > 0) {
        // Determine columns from the first object, excluding id and description
        const allKeys = Object.keys(logs[0]);
        this.columnNames = allKeys.filter(key => key !== 'id' && key !== 'description');
        this.displayedColumns = this.columnNames;
        this.dataSource.data = logs;

        // Re-assign paginator/sort if data arrives after view init
        if (this.paginator) {
          this.dataSource.paginator = this.paginator;
        }
        if (this.sort) {
          this.dataSource.sort = this.sort;
        }
      }
    });
  }

  ngOnInit() {
    this.adminStore.loadSummary();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}
