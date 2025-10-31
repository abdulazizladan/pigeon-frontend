import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable, Subject } from 'rxjs';
import { map, shareReplay, takeUntil } from 'rxjs/operators';
import { AuthStore } from '../../../../auth/store/auth.store';

@Component({
  selector: 'app-layout',
  standalone: false,
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent implements OnInit, OnDestroy{
  
  public authStore = inject(AuthStore);

  isHandset$: Observable<boolean>;
  isHandset: boolean = false; // Initial value

  private destroy$ = new Subject<void>();

  constructor(private breakpointObserver: BreakpointObserver) {
    // Observable to check if the current screen size matches a "handset" (small) screen
    this.isHandset$ = this.breakpointObserver.observe(Breakpoints.Handset)
      .pipe(
        map(result => result.matches),
        shareReplay()
      );
  }

  logout() {
    this.authStore.logout();
  }

  ngOnInit(): void {
    this.isHandset$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isMatch => {
        this.isHandset = isMatch;
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
