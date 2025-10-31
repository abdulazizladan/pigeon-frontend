import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';

import { FlexLayoutModule } from '@angular/flex-layout';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { BaseChartDirective } from 'ng2-charts';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ChartConfiguration, ChartData, ChartEvent, ChartType } from 'chart.js';

import { ManagerRoutingModule } from './manager-routing.module';
import { SettingsComponent } from './components/settings/settings.component';
import { ProfileComponent } from './components/profile/profile.component';
import { LayoutComponent } from './components/layout/layout.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';


@NgModule({
  providers: [
    provideHttpClient()
  ],
  declarations: [
    SettingsComponent,
    ProfileComponent,
    LayoutComponent,
    DashboardComponent
  ],
  imports: [
    CommonModule,
    FlexLayoutModule,
    FlexLayoutModule,
    MatToolbarModule,
    MatCardModule,
    MatSidenavModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatProgressBarModule,
    MatDividerModule,
    MatListModule,
    BaseChartDirective,
    MatProgressSpinnerModule,
    ManagerRoutingModule
  ]
})
export class ManagerModule { }
