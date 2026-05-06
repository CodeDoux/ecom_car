import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Commande } from '../models/commande';

@Injectable({ providedIn: 'root' })
export class CommandeService {

  private readonly endpoint = 'commandes';

  constructor(private http: HttpClient) {}

  // GET /api/commandes
  getAll(): Observable<Commande[]> {
    return this.http.get<Commande[]>(`${this.endpoint}`);
  }

  // GET /api/commandes/{id}
  getById(id: number): Observable<Commande> {
    return this.http.get<Commande>(`${this.endpoint}/${id}`);
  }

  // PUT /api/commandes/{id}/status
  updateStatus(id: number, status: string): Observable<Commande> {
    return this.http.put<Commande>(`${this.endpoint}/${id}/status`, { status });
  }

  // DELETE /api/commandes/{id}
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}/${id}`);
  }
}