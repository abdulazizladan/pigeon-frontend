import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { AuthStore } from '../../store/auth.store';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit{

  public authStore = inject(AuthStore);

  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  loginForm: FormGroup = new FormGroup({})

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: this.fb.control('', [Validators.required, Validators.email]),
      password: this.fb.control('', Validators.required)
    })
  }

  submit() {
    /**this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        console.log(response)
      }
    })*/
   this.authStore.login(this.loginForm.value)
  }

}
