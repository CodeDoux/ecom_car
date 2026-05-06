import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Car } from '../models/car';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CarService {

private readonly endpoint = 'cars';

  constructor(private http: HttpClient) {}

  getCars(): Observable<Car[]> {
    return this.http.get<Car[]>(this.endpoint);
  }

  getCar(id: number): Observable<Car> {
    return this.http.get<Car>(`${this.endpoint}/${id}`);
  }

  createCar(formData: FormData): Observable<Car> {
    return this.http.post<Car>(this.endpoint, formData);
  }

  updateCar(id: number, formData: FormData): Observable<Car> {
    return this.http.put<Car>(`${this.endpoint}/${id}`, formData);
  }

  deleteCar(id: number): Observable<any> {
    return this.http.delete(`${this.endpoint}/${id}`);
  }

  getImages(carId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.endpoint}/${carId}/images`);
  }

  uploadImages(carId: number, files: File[]): Observable<any> {
    const formData = new FormData();
    files.forEach(f => formData.append('images[]', f));
    return this.http.post(`${this.endpoint}/${carId}/images`, formData);
  }

  deleteImage(imageId: number): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}/car-images/${imageId}`);
  }

  setPrimary(imageId: number): Observable<any> {
    return this.http.put(`${this.endpoint}/car-images/${imageId}/primary`, {});
  }
}
