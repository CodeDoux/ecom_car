import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user';

@Injectable({ providedIn: 'root' })
export class UserService {

  private readonly endpoint = 'users';

  constructor(private http: HttpClient) {}

  // GET /api/users
  getAll(): Observable<User[]> {
    return this.http.get<User[]>(`${this.endpoint}`);
  }

  // GET /api/users/{id}
  getById(id: number): Observable<User> {
    return this.http.get<User>(`${this.endpoint}/${id}`);
  }

  // PUT /api/users/{id}/role
  updateRole(id: number, role: string): Observable<User> {
    return this.http.put<User>(`${this.endpoint}/${id}/role`, { role });
  }

  // DELETE /api/users/{id}
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}/${id}`);
  }
}