import { HttpInterceptorFn } from '@angular/common/http';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req);
};
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor() {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Une erreur est survenue';

        if (error.error instanceof ErrorEvent) {
          // Erreur côté client
          errorMessage = `Erreur: ${error.error.message}`;
        } else {
          // Erreur côté serveur
          if (error.error && error.error.message) {
            errorMessage = error.error.message;
          } else if (error.status === 0) {
            errorMessage = 'Impossible de contacter le serveur. Vérifiez votre connexion.';
          } else if (error.status === 404) {
            errorMessage = 'Ressource non trouvée.';
          } else if (error.status === 500) {
            errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
          } else if (error.status === 422) {
            // Erreurs de validation Laravel
            errorMessage = 'Erreur de validation. Vérifiez les champs.';
            
            // Récupérer les erreurs de validation
            if (error.error && error.error.errors) {
              const validationErrors = error.error.errors;
              const firstErrorKey = Object.keys(validationErrors)[0];
              if (firstErrorKey && validationErrors[firstErrorKey][0]) {
                errorMessage = validationErrors[firstErrorKey][0];
              }
            }
          }
        }

        console.error('HTTP Error:', error);
        return throwError(() => ({ message: errorMessage, error }));
      })
    );
  }
}