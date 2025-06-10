import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '../models/user.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DirectorService {

  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.baseUrl;

  constructor() { }

  getStations() {
    const url: string = `https://pigeon-backend-17s7.onrender.com/station`;
    return this.http.get(url)
  }

  getProfile(email: string): Promise<User> {
      return firstValueFrom(
        this.http.get<{success: boolean, data: User, message: string}>(`${this.baseUrl}/user/${email}`).pipe(
          map(response => response.data)
        )
      )
    }
}
