import { Component, inject, OnInit } from '@angular/core';
import { AuthStore } from '../../../../auth/store/auth.store';
import { DirectorStore } from '../../store/director.store';

@Component({
  selector: 'app-profile',
  standalone: false,
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit{

  public authStore = inject(AuthStore);
  public directorStore = inject(DirectorStore);
  private email: string | null = '';

  ngOnInit(): void {
    this.email = this.authStore.userEmail();
    this.directorStore.loadProfile(this.email as string);
  }

}
