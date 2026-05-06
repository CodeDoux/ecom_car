import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SettingService {

  private readonly endpoint = 'settings';
  private settingsSubject = new BehaviorSubject<Record<string, string>>({});
  settings$ = this.settingsSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Charger tous les settings au démarrage
  load(): Observable<any> {
    return this.http.get<any>(`${this.endpoint}`).pipe(
      tap((groups) => {
        const flat: Record<string, string> = {};
        Object.values(groups).forEach((group: any) => {
          group.forEach((s: any) => flat[s.key] = s.value ?? '');
        });
        this.settingsSubject.next(flat);
      })
    );
  }

  // Récupérer une valeur par clé
  get(key: string, fallback = ''): string {
    return this.settingsSubject.getValue()[key] ?? fallback;
  }

  // Sauvegarder
  save(settings: { key: string; value: string }[]): Observable<any> {
    return this.http.put(`${this.endpoint}`, { settings });
  }
}