import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ManagersStore } from '../../store/managers.store';
import { AuthStore } from '../../../auth/store/auth.store';
import { fullName } from '../../../users-management/models/user.model';

@Component({
  selector: 'app-manager-details',
  standalone: false,
  templateUrl: './manager-details.html',
  styleUrl: './manager-details.css',
})
export class ManagerDetailsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly store = inject(ManagersStore);
  private readonly auth = inject(AuthStore);

  protected readonly managerId = signal(this.route.snapshot.paramMap.get('id') ?? '');
  protected readonly manager = computed(() => this.store.managerById(this.managerId()));
  protected readonly canManage = this.auth.canManageUsers;

  protected readonly isLoading = computed(() => this.store.loadingState() === 'loading' && !this.manager());
  protected readonly loadError = computed(() => (this.store.loadingState() === 'error' ? this.store.errorMessage() : null));
  protected readonly notFound = computed(() => this.store.loadingState() === 'success' && !this.manager());
  protected readonly isUpdating = computed(() => this.store.isUpdating(this.managerId()));

  protected readonly displayName = computed(() => {
    const m = this.manager();
    return m ? fullName(m) : '';
  });

  protected readonly initial = computed(() => {
    const m = this.manager();
    return m ? (m.firstName || m.username).charAt(0).toUpperCase() : 'M';
  });

  protected readonly confirmUnassign = signal(false);

  ngOnInit() {
    if (!this.manager() && this.store.loadingState() !== 'loading') {
      this.store.loadManagers();
    }
  }

  protected goBack() {
    this.router.navigate(['..'], { relativeTo: this.route });
  }

  protected openAssign() {
    this.store.openAssignStationModal(this.managerId());
  }

  protected askUnassign() {
    this.store.clearUpdateError();
    this.confirmUnassign.set(true);
  }

  protected cancelUnassign() {
    this.confirmUnassign.set(false);
  }

  protected unassign() {
    const m = this.manager();
    if (!m?.station) return;
    this.confirmUnassign.set(false);
    this.store.unassignStation({ managerId: m.id, stationId: m.station.id });
  }

  protected viewStation(stationId: string) {
    // ../../stations/:id relative to /<shell>/managers/:id keeps us in the current shell.
    this.router.navigate(['../..', 'stations', stationId], { relativeTo: this.route });
  }
}
