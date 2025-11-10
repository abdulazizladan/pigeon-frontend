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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ChartConfiguration, ChartData, ChartEvent } from 'chart.js';
import { BaseChartDirective, 
  provideCharts, 
  withDefaultRegisterables } from 'ng2-charts';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { DirectorRoutingModule } from './director-routing.module';
import { LayoutComponent } from './components/layout/layout.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { SettingsComponent } from './components/settings/settings.component';
import { ProfileComponent } from './components/profile/profile.component';
import { MatInputModule } from '@angular/material/input';
import { ChangePassword } from './components/change-password/change-password';
import { MatSnackBarModule } from '@angular/material/snack-bar';


@NgModule({
  providers: [
    provideHttpClient(),
    provideCharts(withDefaultRegisterables())
  ],
  declarations: [
    LayoutComponent,
    DashboardComponent,
    SettingsComponent,
    ProfileComponent,
    ChangePassword
  ],
  imports: [
    CommonModule,
    BaseChartDirective,
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
    MatInputModule,
    MatSnackBarModule,
    FormsModule, 
    ReactiveFormsModule,
    MatInputModule,
    DirectorRoutingModule
  ]
})
export class DirectorModule { }
