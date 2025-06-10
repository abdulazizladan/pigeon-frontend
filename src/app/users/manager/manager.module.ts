import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

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

import { ManagerRoutingModule } from './manager-routing.module';
import { SettingsComponent } from './components/settings/settings.component';
import { ProfileComponent } from './components/profile/profile.component';
import { LayoutComponent } from './components/layout/layout.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';


@NgModule({
  declarations: [
    SettingsComponent,
    ProfileComponent,
    LayoutComponent,
    DashboardComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
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
    ManagerRoutingModule
  ]
})
export class ManagerModule { }
