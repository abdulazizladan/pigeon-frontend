import { Component, effect, inject, OnInit } from '@angular/core';
import { TicketsStore } from '../../store/ticket.store';
import { ActivatedRoute } from '@angular/router';
import { FormControl, Validators } from '@angular/forms';
import { AuthStore } from '../../../../auth/store/auth.store';

@Component({
  selector: 'app-ticket-details',
  standalone: false,
  templateUrl: './ticket-details.component.html',
  styleUrl: './ticket-details.component.scss'
})
export class TicketDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  public ticketId: string = "";
  public ticketStore = inject(TicketsStore);
  public authStore = inject(AuthStore);

  replyControl = new FormControl('', [Validators.required]);

  constructor() {
    effect(() => {
      const ticket = this.ticketStore.selectedTicket();
      if (ticket && ticket.status !== 'active') {
        this.replyControl.disable();
      } else {
        this.replyControl.enable();
      }
    });
  }

  ngOnInit(): void {
    this.ticketId = this.route.snapshot.paramMap.get('id') || "";
    this.ticketStore.selectTicket(this.ticketId);
    this.ticketStore.loadTickets();
  }

  submitReply() {
    if (this.replyControl.valid && this.ticketId) {
      this.ticketStore.addReply(this.ticketId, this.replyControl.value!);
      this.replyControl.reset();
    }
  }
}
