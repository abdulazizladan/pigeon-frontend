import { Component, inject, computed, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UsersStore } from '../../store/users.store';
import { AuthStore } from '../../../auth/store/auth.store';
import { ThemeService } from '../../../theme.service';
import { User, fullName } from '../../models/user.model';
import { Activity, activityGroup, relativeTime } from '../../models/activity.model';

@Component({
  selector: 'app-user-details',
  standalone: false,
  templateUrl: './user-details.html',
  styleUrl: './user-details.css',
})
export class UserDetailsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly store = inject(UsersStore);
  private readonly auth = inject(AuthStore);
  private readonly themeService = inject(ThemeService);

  protected readonly userId = computed(() => this.route.snapshot.paramMap.get('id') ?? '');

  protected readonly user = computed(() =>
    this.store.users().find((u) => u.id === this.userId()) ?? null,
  );

  protected readonly isLoading = computed(() => this.store.loadingState() === 'loading');
  protected readonly loadError = computed(() => this.store.loadingState() === 'error' ? this.store.errorMessage() : null);

  protected readonly currentUser = this.auth.user;
  /** Only admins may read another user's activity log. */
  protected readonly canViewActivity = computed(() => this.auth.role() === 'admin');
  protected readonly activities = this.store.activities;
  protected readonly activitiesHasMore = this.store.activitiesHasMore;
  protected readonly activitiesLoading = computed(() => this.store.activitiesLoadingState() === 'loading');
  protected readonly activitiesError = computed(() =>
    this.store.activitiesLoadingState() === 'error' ? this.store.activitiesErrorMessage() : null,
  );

  protected get theme() {
    return this.themeService.theme;
  }

  ngOnInit() {
    // If users haven't been loaded yet, load them
    if (this.store.loadingState() === 'idle') {
      this.store.loadUsers();
    }
    if (this.canViewActivity() && this.userId()) {
      this.store.loadActivities(this.userId());
    }
  }

  protected reloadActivities() {
    this.store.loadActivities(this.userId());
  }

  protected loadMoreActivities() {
    this.store.loadMoreActivities();
  }

  protected group(activity: Activity): string {
    return activityGroup(activity.action);
  }

  protected when(activity: Activity): string {
    return relativeTime(activity.createdAt);
  }

  /** Where a timeline entry can link to inside the current shell, if anywhere. */
  protected targetLink(activity: Activity): string[] | null {
    if (!activity.targetId) return null;
    switch (activity.targetType) {
      case 'station': return ['../..', 'stations', activity.targetId];
      case 'user': return ['..', activity.targetId];
      case 'ticket': return ['../..', 'tickets'];
      default: return null;
    }
  }

  protected trackActivity(_: number, activity: Activity): string {
    return activity.id;
  }

  protected goBack() {
    this.router.navigate(['..'], { relativeTo: this.route });
  }

  protected getRoleLabel(role: string): string {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'director': return 'Director';
      case 'manager': return 'Manager';
      default: return role;
    }
  }

  protected getRoleDescription(role: string): string {
    switch (role) {
      case 'admin': return 'Full system access with user management and configuration privileges.';
      case 'director': return 'Team leadership access — can manage staff and create managers.';
      case 'manager': return 'Operational access for managing daily workflows and tasks.';
      default: return '';
    }
  }

  protected getFullName(user: User): string {
    return fullName(user);
  }

  protected getInitials(user: User): string {
    return (user.firstName || user.username).charAt(0).toUpperCase();
  }
}
