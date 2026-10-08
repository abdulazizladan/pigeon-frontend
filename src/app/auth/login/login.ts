import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthStore } from '../store/auth.store';
import { ThemeService } from '../../theme.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
  standalone: false,
})
export class LoginComponent implements OnInit {
  protected readonly store = inject(AuthStore);
  protected readonly themeService = inject(ThemeService);
  private readonly route = inject(ActivatedRoute);

  protected readonly username = signal<string>('');
  protected readonly password = signal<string>('');
  protected readonly validationError = signal<string>('');
  protected readonly showSeedHint = !environment.production;

  private returnUrl: string | null = null;

  protected get theme() {
    return this.themeService.theme;
  }

  protected toggleTheme() {
    this.themeService.toggleTheme();
  }

  ngOnInit() {
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
  }

  protected onLogin(event: Event) {
    event.preventDefault();
    if (!this.username().trim() || !this.password()) {
      this.validationError.set('Please fill out all fields.');
      return;
    }
    this.validationError.set('');
    this.store.login({
      username: this.username().trim(),
      password: this.password(),
      returnUrl: this.returnUrl,
    });
  }

  protected updateField(field: 'username' | 'password', event: Event) {
    const value = (event.target as HTMLInputElement).value;
    if (field === 'username') {
      this.username.set(value);
    } else {
      this.password.set(value);
    }
    if (this.store.errorMessage()) this.store.clearError();
    if (this.validationError()) this.validationError.set('');
  }
}
