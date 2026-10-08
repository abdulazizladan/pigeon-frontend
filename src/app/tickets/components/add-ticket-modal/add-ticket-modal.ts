import { Component, inject, signal, computed, effect, OnDestroy } from '@angular/core';
import { TicketsStore } from '../../store/tickets.store';
import {
  TicketPriority,
  TICKET_PRIORITIES,
  ticketPriorityDescription,
} from '../../models/ticket.model';

@Component({
  selector: 'app-add-ticket-modal',
  standalone: false,
  templateUrl: './add-ticket-modal.html',
  styleUrl: './add-ticket-modal.css',
})
export class AddTicketModalComponent implements OnDestroy {
  protected readonly store = inject(TicketsStore);

  protected readonly priorities = TICKET_PRIORITIES;

  protected readonly title = signal<string>('');
  protected readonly description = signal<string>('');
  protected readonly priority = signal<TicketPriority>('medium');

  protected readonly titleError = computed(() => {
    const val = this.title().trim();
    if (val && val.length < 5) return 'Title must be at least 5 characters.';
    if (val.length > 120) return 'Title must be 120 characters or fewer.';
    return null;
  });

  protected readonly descriptionError = computed(() => {
    const val = this.description().trim();
    if (val && val.length < 10) return 'Please describe the issue in at least 10 characters.';
    if (val.length > 2000) return 'Description must be 2000 characters or fewer.';
    return null;
  });

  protected readonly isFormValid = computed(
    () =>
      this.title().trim().length >= 5 &&
      this.description().trim().length >= 10 &&
      !this.titleError() &&
      !this.descriptionError(),
  );

  protected readonly isSubmitting = computed(() => this.store.createLoadingState() === 'loading');

  constructor() {
    effect(() => {
      if (this.store.createLoadingState() === 'success') {
        this.resetForm();
      }
    });
  }

  ngOnDestroy() {
    this.resetForm();
  }

  protected onClose() {
    this.store.closeAddTicketModal();
    this.resetForm();
  }

  protected onBackdropClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('um-modal-backdrop')) {
      this.onClose();
    }
  }

  protected onSubmit(event: Event) {
    event.preventDefault();
    if (!this.isFormValid() || this.isSubmitting()) return;
    this.store.createTicket({
      title: this.title().trim(),
      description: this.description().trim(),
      priority: this.priority(),
    });
  }

  protected updateTitle(event: Event) {
    this.title.set((event.target as HTMLInputElement).value);
  }

  protected updateDescription(event: Event) {
    this.description.set((event.target as HTMLTextAreaElement).value);
  }

  protected updatePriority(event: Event) {
    this.priority.set((event.target as HTMLInputElement).value as TicketPriority);
  }

  protected priorityDescription(priority: TicketPriority): string {
    return ticketPriorityDescription(priority);
  }

  private resetForm() {
    this.title.set('');
    this.description.set('');
    this.priority.set('medium');
  }
}
