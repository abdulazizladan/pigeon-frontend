import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { inject } from '@angular/core';
import { AdminService } from '../services/admin.service';
import { usersSummary } from '../models/users-summary.model';
import { TicketsSummary } from '../models/tickets-summary.model';
import { User } from '../models/user.model';
import { AttendantsSummary } from '../models/attendants-summary.model';
import { StationsSummary } from '../models/stations-summary.model';

interface AdminState {
  usersSummary: usersSummary;
  ticketsSummary: TicketsSummary;
  attendantsSummary: AttendantsSummary;
  stationsSummary: StationsSummary;
  loading: boolean;
  error: string | null;
  profile: User | null
}

const initialState: AdminState = {
  usersSummary: {
    total: 0,
    active: 0,
    suspended: 0,
    removed: 0,
    admin: 0,
    directors: 0,
    managers: 0
  },
  ticketsSummary: {
    total: 0,
    active: 0,
    resolved: 0,
    dismissed: 0
  },
  stationsSummary: {
    total: 0,
    active: 0,
    inactive: 0
  },
  attendantsSummary: {
    total: 0,
    active: 0,
    suspended: 0
  },
  loading: false,
  error: null,
  profile: null
}

export const AdminStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, adminService = inject(AdminService)) => ({
    async loadSummary() {
      patchState(store, { loading: true, error: null });
      try {
        const [users, tickets, attendants, stations] = await Promise.all([
          adminService.getUserSummary(),
          adminService.getTicketsSummary(),
          adminService.getAttendantsSummary(),
          adminService.getStationsSummary()
        ]);

        patchState(store, {
          usersSummary: users,
          ticketsSummary: tickets,
          attendantsSummary: attendants,
          stationsSummary: stations,
          loading: false
        });
      } catch (error) {
        console.error('Error loading summary: ', error);
        patchState(store, {
          error: 'Failed to load summary. Please try again.',
          loading: false
        })
      }
    },
    async loadProfile(email: string) {
      patchState(store, { loading: true, error: null });
      try {
        const userProfile = await adminService.getProfile(email);
        patchState(store, { error: null, loading: false, profile: userProfile })
      } catch (error) {
        patchState(store, {
          error: 'Failed to load profile. Please check your connection and try again.',
          loading: false
        })
      }
    }
  }))
)
