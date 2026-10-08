import { Component, computed, inject, OnInit } from '@angular/core';
import { AuthStore } from '../../../../auth/store/auth.store';
import { UsersStore } from '../../../../users-management/store/users.store';
import { TicketsStore } from '../../../../tickets/store/tickets.store';

interface StatCard {
  key: string;
  title: string;
  value: number;
  cssClass: string;
  link: string;
  icon: 'users' | 'shield' | 'briefcase' | 'person' | 'ticket' | 'open' | 'progress' | 'check' | 'archive' | 'alert';
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: false,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class AdminDashboardComponent implements OnInit {
  protected readonly auth = inject(AuthStore);
  protected readonly usersStore = inject(UsersStore);
  protected readonly ticketsStore = inject(TicketsStore);

  protected readonly greetingName = computed(() => this.auth.username() || 'Admin');

  protected readonly userCards = computed<StatCard[]>(() => {
    const counts = this.usersStore.roleCounts();
    return [
      { key: 'total', title: 'Total Users', value: this.usersStore.totalCount(), cssClass: 'stat-total', link: '/admin/users', icon: 'users' },
      { key: 'admin', title: 'Admins', value: counts.admin, cssClass: 'stat-admin', link: '/admin/users', icon: 'shield' },
      { key: 'director', title: 'Directors', value: counts.director, cssClass: 'stat-director', link: '/admin/users', icon: 'briefcase' },
      { key: 'manager', title: 'Managers', value: counts.manager, cssClass: 'stat-manager', link: '/admin/users', icon: 'person' },
    ];
  });

  protected readonly ticketCards = computed<StatCard[]>(() => {
    const byStatus = this.ticketsStore.statusCounts();
    const byPriority = this.ticketsStore.priorityCounts();
    return [
      { key: 'total', title: 'Total Tickets', value: this.ticketsStore.totalCount(), cssClass: 'stat-tickets', link: '/admin/tickets', icon: 'ticket' },
      { key: 'open', title: 'Open', value: byStatus.open, cssClass: 'stat-open', link: '/admin/tickets', icon: 'open' },
      { key: 'in_progress', title: 'In Progress', value: byStatus.in_progress, cssClass: 'stat-progress', link: '/admin/tickets', icon: 'progress' },
      { key: 'resolved', title: 'Resolved', value: byStatus.resolved, cssClass: 'stat-resolved', link: '/admin/tickets', icon: 'check' },
      { key: 'closed', title: 'Closed', value: byStatus.closed, cssClass: 'stat-closed', link: '/admin/tickets', icon: 'archive' },
      { key: 'urgent', title: 'Urgent', value: byPriority.urgent, cssClass: 'stat-urgent', link: '/admin/tickets', icon: 'alert' },
    ];
  });

  protected readonly usersLoading = computed(() => this.usersStore.loadingState() === 'loading');
  protected readonly ticketsLoading = computed(() => this.ticketsStore.loadingState() === 'loading');

  ngOnInit() {
    this.usersStore.loadUsers();
    this.ticketsStore.loadTickets();
  }

  protected trackByKey(_: number, card: StatCard): string {
    return card.key;
  }
}
