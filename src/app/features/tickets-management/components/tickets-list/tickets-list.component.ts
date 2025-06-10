import { Component, inject, OnInit } from '@angular/core';
import { TicketsStore } from '../../store/ticket.store';
import { MatDialog } from '@angular/material/dialog';
import { AddTicketComponent } from '../add-ticket/add-ticket.component';
import { AuthStore } from '../../../../auth/store/auth.store';

@Component({
  selector: 'app-tickets-list',
  standalone: false,
  templateUrl: './tickets-list.component.html',
  styleUrl: './tickets-list.component.scss'
})
export class TicketsListComponent implements OnInit{

  public ticketsStore = inject(TicketsStore);
  public authStore = inject(AuthStore);
  dialog = inject(MatDialog)
  public displayedColumns: string[] = ['title', 'description', 'sender', 'status', 'dateCreated'];

  ngOnInit(): void {
    this.ticketsStore.loadTickets();
  }

  openAddTicketDialog() {
    const dialogRef = this.dialog.open(AddTicketComponent, {
      width: '480px'
    });
    dialogRef.afterClosed().subscribe(result => {
      if(result) {
        this.ticketsStore.addTicket(result)
      }
    })
  }

  //a function that returns a filtered tickets list based on ticket status
  getFilteredTickets(status: string) {
    return this.ticketsStore.tickets().filter(ticket => ticket.status === status);
  }

}
