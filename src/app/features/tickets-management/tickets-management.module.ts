import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

import { FlexLayoutModule } from '@angular/flex-layout';

import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';

import { TicketsManagementRoutingModule } from './tickets-management-routing.module';
import { TicketsListComponent } from './components/tickets-list/tickets-list.component';
import { TicketDetailsComponent } from './components/ticket-details/ticket-details.component';
import { AddTicketComponent } from './components/add-ticket/add-ticket.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';



@NgModule({
  declarations: [
    TicketsListComponent,
    TicketDetailsComponent,
    AddTicketComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    MatSlideToggleModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    MatTableModule,
    MatIconModule,
    MatProgressBarModule,
    MatCardModule,
    MatSelectModule,
    TicketsManagementRoutingModule
  ]
})
export class TicketsManagementModule { }
