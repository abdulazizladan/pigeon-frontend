import { Component, inject, OnInit, ViewChild, AfterViewInit, effect } from '@angular/core';
import { TicketsStore } from '../../store/ticket.store';
import { MatDialog } from '@angular/material/dialog';
import { AddTicketComponent } from '../add-ticket/add-ticket.component';
import { AuthStore } from '../../../../auth/store/auth.store';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Ticket } from '../../models/ticket.model';

@Component({
  selector: 'app-tickets-list',
  standalone: false,
  templateUrl: './tickets-list.component.html',
  styleUrl: './tickets-list.component.scss'
})
export class TicketsListComponent implements OnInit, AfterViewInit {

  public ticketsStore = inject(TicketsStore);
  public authStore = inject(AuthStore);
  dialog = inject(MatDialog)
  public displayedColumns: string[] = ['title', 'description', 'sender', 'status', 'dateCreated'];

  dataSource = new MatTableDataSource<Ticket>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor() {
    effect(() => {
      this.dataSource.data = this.ticketsStore.tickets();
      if (this.paginator) {
        this.dataSource.paginator = this.paginator;
      }
    });
  }

  ngOnInit(): void {
    const role = this.authStore.userRole();
    if (role === 'admin') {
      this.ticketsStore.loadTickets();
      this.ticketsStore.loadStats();
    } else {
      const email = this.authStore.userEmail();
      if (email) {
        this.ticketsStore.loadTicketsByEmail(email);
      }
    }

    this.dataSource.filterPredicate = (data: Ticket, filter: string) => {
      if (filter === 'all') return true;
      return data.status === filter;
    };
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  applyFilter(status: string) {
    this.dataSource.filter = status;
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  openAddTicketDialog() {
    const dialogRef = this.dialog.open(AddTicketComponent, {
      width: '480px'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.ticketsStore.addTicket(result)
      }
    })
  }

  onStatusChange(ticket: any, status: string) {
    if (ticket.status !== status) {
      this.ticketsStore.updateTicket(ticket.id, { status });
    }
  }
}
