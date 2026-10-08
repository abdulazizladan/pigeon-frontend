import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ManagersStore } from '../../store/managers.store';
import { Manager } from '../../models/manager.model';
import { fullName } from '../../../users-management/models/user.model';

@Component({
  selector: 'app-managers-list',
  standalone: false,
  templateUrl: './managers-list.html',
  styleUrl: './managers-list.css',
})
export class ManagersListComponent implements OnInit {
  protected readonly store = inject(ManagersStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  ngOnInit() {
    this.store.loadManagers();
  }

  protected onSearch(event: Event) {
    this.store.setSearchQuery((event.target as HTMLInputElement).value);
  }

  protected viewManager(id: string) {
    this.router.navigate([id], { relativeTo: this.route });
  }

  protected name(m: Manager): string {
    return fullName(m);
  }

  protected initial(m: Manager): string {
    return (m.firstName || m.username).charAt(0).toUpperCase();
  }

  protected trackById(_: number, m: Manager): string {
    return m.id;
  }
}
