import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

import { FlexLayoutModule } from '@angular/flex-layout';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { AuthRoutingModule } from './auth-routing.module';
import { LoginComponent } from './components/login/login.component';


@NgModule({
  declarations: [
    LoginComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    AuthRoutingModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule
  ],
  providers: [
    provideCharts(withDefaultRegisterables())
  ]
})
export class AuthModule { }
