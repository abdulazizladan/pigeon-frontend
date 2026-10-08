export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

export const TICKET_STATUSES: TicketStatus[] = ['open', 'in_progress', 'resolved', 'closed'];
export const TICKET_PRIORITIES: TicketPriority[] = ['low', 'medium', 'high', 'urgent'];

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdById: string | null;
  createdByUsername: string | null;
  assignedToId: string | null;
  assignedToUsername: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTicketPayload {
  title: string;
  description: string;
  priority?: TicketPriority;
}

export interface UpdateTicketPayload {
  status?: TicketStatus;
  priority?: TicketPriority;
  assignedToId?: string | null;
}

export interface TicketStats {
  total: number;
  byStatus: Record<TicketStatus, number>;
  byPriority: Record<TicketPriority, number>;
}

export function ticketStatusLabel(status: TicketStatus): string {
  switch (status) {
    case 'open': return 'Open';
    case 'in_progress': return 'In Progress';
    case 'resolved': return 'Resolved';
    case 'closed': return 'Closed';
  }
}

export function ticketPriorityDescription(priority: TicketPriority): string {
  switch (priority) {
    case 'low': return 'Minor issue, no deadline';
    case 'medium': return 'Should be handled this week';
    case 'high': return 'Blocking a user, handle soon';
    case 'urgent': return 'Outage or security issue';
  }
}
