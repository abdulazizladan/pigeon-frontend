import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { User } from '../models/user.model';
import { firstValueFrom, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { UserDetail } from '../models/user-detail.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private baseUrl = environment.baseUrl;
  private readonly http = inject(HttpClient)

  /**
   *
   * @returns
   */
  async getUsers(): Promise<User[]> {
    return firstValueFrom(
      this.http.get<{success: Boolean, error: string | null, data: User[]}>(`${this.baseUrl}/user`).pipe(
        map(response => response.data)
      )
    );
  }

  /**
   *
   * @param user
   * @returns
   */
  async createUser(user: Omit<User, 'id'>): Promise<User> {
    return firstValueFrom(
      this.http.post<{data: User, success: boolean, message: string}>(`${this.baseUrl}/user`, user).pipe(
        map(response => response.data)
      )
    );
  }

  /**
   *
   * @param email
   * @returns
   */
  async getUserByEmail(email: string): Promise<UserDetail> {
    return firstValueFrom(
      this.http.get<{success: boolean, data: UserDetail, message: string}>(`${this.baseUrl}/user/${email}`).pipe(
        map(response => response.data)
      )
    );
  }

  async updateUser(user: User): Promise<User> {
    return firstValueFrom(
      this.http.put<User>(`${this.baseUrl}/user/${user.id}`, user)
    );
  }

  async suspendUser(email: string): Promise<UserDetail> {
    return firstValueFrom(
      this.http.patch<UserDetail>(`${this.baseUrl}/user/${email}`, {status: 'inactive'}).pipe(

      )
    );
  }

  async enableUser(email: string): Promise<UserDetail> {
    return firstValueFrom(
      this.http.patch<UserDetail>(`${this.baseUrl}/user/${email}`, {status: 'active'}).pipe(
      )
    );
  }

}
