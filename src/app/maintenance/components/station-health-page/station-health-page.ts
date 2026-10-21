import { Component } from '@angular/core';

/** Manager page: their own station's health checks and repair requests. */
@Component({
  selector: 'app-station-health-page',
  standalone: false,
  template: `
    <div class="mp-page">
      <header class="mp-header">
        <h1 class="mp-title">Station Health</h1>
        <p class="mp-subtitle">Record the condition of your station and each pump, and ask for repairs when something is faulty.</p>
      </header>
      <app-station-health [stationId]="null" [canRecord]="true" [canReport]="true" title="Health checks"></app-station-health>
      <div class="mp-gap"></div>
      <app-repair-requests-list [stationId]="null" [canDecide]="false" [canReport]="true" title="My repair requests"></app-repair-requests-list>
    </div>
  `,
  styles: [`
    .mp-page { padding: 8px 0 24px; max-width: 1100px; margin: 0 auto; }
    .mp-header { margin-bottom: 20px; }
    .mp-title { margin: 0 0 4px; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; color: var(--text-primary); }
    .mp-subtitle { margin: 0; font-size: 15px; color: var(--text-secondary); }
    .mp-gap { height: 28px; }
  `],
})
export class StationHealthPageComponent {}
