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
      this.http.get<User[]>(`${this.baseUrl}/user`).pipe(
        map(response => response)
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
      this.http.post<User>(`${this.baseUrl}/user`, user)
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

  async suspendUser(id: number): Promise<UserDetail> {
    return firstValueFrom(
      this.http.patch<{success: boolean, data: UserDetail, message: string}>(`${this.baseUrl}/user/suspend/${id}, {status: 'inactive}`, {}).pipe(
        map(response => response.data)
      )
    );
  }

  async unsuspendUser(email: string): Promise<UserDetail> {
    return firstValueFrom(
      this.http.patch<{success: boolean, data: UserDetail, message: string}>(`${this.baseUrl}/user/unsuspend/${email}`, {status: 'active'}).pipe(
        map(response => response.data)
      )
    );
  }

}
