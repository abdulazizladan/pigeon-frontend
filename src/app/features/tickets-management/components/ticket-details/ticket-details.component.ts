import { Component, inject, OnInit } from '@angular/core';
import { TicketsStore } from '../../store/ticket.store';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-ticket-details',
  standalone: false,
  templateUrl: './ticket-details.component.html',
  styleUrl: './ticket-details.component.scss'
})
export class TicketDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  public ticketId: number = 0;
  public ticketStore = inject(TicketsStore);

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.ticketId = Number(this.route.snapshot.paramMap.get('id'));
    this.ticketStore.selectTicket(this.ticketId);
    this.ticketStore.loadTickets();
  }
}
