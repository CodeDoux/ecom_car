import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable, of, switchMap, tap } from 'rxjs';
import { TokenResponse } from '../models/token-response';
import { Login } from '../models/login';
import { User } from '../models/user';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly endpoint = '';
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    // Charger l'utilisateur au démarrage si token existe
    if (this.isAuthenticated()) {
      this.loadUser().subscribe();
    }
  }

  login(data: Login): Observable<TokenResponse> {

        return this.http.post<TokenResponse>(`${this.endpoint}auth/login`, data).pipe(

        tap((response: TokenResponse) => {

        console.log("LOGIN:",response);

        this.saveToken(response.access_token);

        console.log("TOKEN SAVED:",localStorage.getItem('token'));

        }),

        switchMap(()=> this.loadUser())

     );

}

  register(data: User): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${this.endpoint}auth/register`, data).pipe(
      tap((response: TokenResponse) => {
        this.saveToken(response.access_token);
        this.loadUser().subscribe();
      })
    );
  }
 

  logout(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
    this.router.navigate(['/home']);
  }

 logoutApi(): Observable<any> {
  return this.http.post(`${this.endpoint}auth/logout`, {});
}

  saveToken(token: string) {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('token', token);
    }
  }

  getToken(): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('token');
    }
    return null;
  }

  removeToken() {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('token');
    }
    this.currentUserSubject.next(null);
  }

  getHeaders() {
    const token = this.getToken();
    return {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  //Version synchronisée de loadUser
  loadUser(): Observable<any> {
    if (!this.isAuthenticated()) {
      return of(null);
    }

    const token = this.getToken();
    if (!token) {
    this.currentUserSubject.next(null);
    return of(null);
  }
    return this.http.get<any>(`${this.endpoint}user`).pipe(
      tap((user) => {
        console.log('Utilisateur chargé:', user); // Debug
        this.currentUserSubject.next(user);
      }),
      catchError((error) => {
        console.error('Erreur lors du chargement de l\'utilisateur:', error);
        // Si erreur 401, le token n'est plus valide
        if (error.status === 401) {
          this.removeToken();
        }
        return of(null);
      })
    );
  }

  getCurrentUser(): any {
    return this.currentUserSubject.value;
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user && user.role === role;
  }

  hasAnyRole(roles: string[]): boolean {
    const user = this.getCurrentUser();
    return user && roles.includes(user.role);
  }

  // utilitaires pour ProduitService
  getUserRole(): string | null {
    const user = this.getCurrentUser();
    return user ? user.role : null;
  }

  isAdmin(): boolean {
    return this.hasRole('ADMIN');
  }

  isClient(): boolean {
    return this.hasRole('CLIENT');
  }

  isEmploye(): boolean {
    return this.hasRole('EMPLOYE');
  }

  //pour attendre que l'utilisateur soit chargé
  waitForUserLoaded(): Observable<any> {
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      return of(currentUser);
    }
    
    if (!this.isAuthenticated()) {
      return of(null);
    }

    return this.loadUser();
  }
}
