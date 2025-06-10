import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TicketsListComponent } from './components/tickets-list/tickets-list.component';
import { TicketDetailsComponent } from './components/ticket-details/ticket-details.component';

const routes: Routes = [
  {
    path: "",
    redirectTo: 'tickets',
    pathMatch: 'full'
  },
  {
    path: "tickets",
    component: TicketsListComponent
  },
  {
    path: "tickets/:id",
    component: TicketDetailsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TicketsManagementRoutingModule { }
