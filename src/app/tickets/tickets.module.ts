import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TicketsRoutingModule } from './tickets-routing.module';
import { TicketsListComponent } from './components/tickets-list/tickets-list';
import { AddTicketModalComponent } from './components/add-ticket-modal/add-ticket-modal';

@NgModule({
  declarations: [TicketsListComponent, AddTicketModalComponent],
  imports: [CommonModule, TicketsRoutingModule],
})
export class TicketsModule {}
