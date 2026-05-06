import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable()
export class ApiInterceptor implements HttpInterceptor {

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {

    // Ajouter URL API
    if (!request.url.startsWith('http')) {
      request = request.clone({
        url: `${environment.apiUrl}/${request.url}`
      });
    }

    const token = localStorage.getItem('token');

    let headers:any = {
      'Accept':'application/json'
    };

    // ⚠️ Ne pas mettre Content-Type si FormData
    if(!(request.body instanceof FormData)){
      headers['Content-Type'] = 'application/json';
    }

    if(token){
      headers['Authorization'] = `Bearer ${token}`;
    }

    request = request.clone({
      setHeaders: headers,
      withCredentials:false
    });

    return next.handle(request);
  }
}