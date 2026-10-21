import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { LoginComponent } from './auth/login/login';
import { authInterceptor } from './auth/auth.interceptor';
import { ConfirmDialogComponent } from './shared/confirm-dialog/confirm-dialog';

@NgModule({
  declarations: [App, LoginComponent],
  imports: [BrowserModule, AppRoutingModule, FormsModule, ConfirmDialogComponent],
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withInterceptors([authInterceptor])),
  ],
  bootstrap: [App],
})
export class AppModule {}
