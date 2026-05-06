import { Injectable } from '@angular/core';
import { Categorie } from '../models/categorie';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CategorieService {


  private readonly endpoint = 'categories';

  constructor(private http: HttpClient) {}

  getCategories(): Observable<Categorie[]> {
    return this.http.get<Categorie[]>(this.endpoint);
  }

  getCategory(id: number): Observable<Categorie> {
    return this.http.get<Categorie>(`${this.endpoint}/${id}`);
  }

  createCategory(payload: Partial<Categorie>): Observable<Categorie> {
    return this.http.post<Categorie>(this.endpoint, payload);
  }

  updateCategory(id: number, payload: Partial<Categorie>): Observable<Categorie> {
    return this.http.put<Categorie>(`${this.endpoint}/${id}`, payload);
  }

  deleteCategory(id: number): Observable<any> {
    return this.http.delete(`${this.endpoint}/${id}`);
  }
}
