import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  constructor(
    private authService: AuthService,
    private router: Router
  ){}

  form = {
    email:    '',
    password: '',
    remember: false,
  };

errors: { [key: string]: string } = {};
  globalError = '';
  isLoading   = false;
  showPassword = false;
  focusedField = '';

  onLogin(): void {
    this.errors = {};
    this.globalError = '';

    if (!this.form['email']) {
      this.errors['email'] = 'L\'adresse email est requise.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.form['email'])) {
      this.errors['email'] = 'Adresse email invalide.';
    }

    if (!this.form['password']) {
      this.errors['password'] = 'Le mot de passe est requis.';
    } else if (this.form['password'].length < 6) {
      this.errors['password'] = 'Minimum 6 caractères.';
    }

    if (Object.keys(this.errors).length > 0) return;

    this.isLoading = true;

    this.authService.login(this.form).pipe(
      switchMap((response) => {
        // Charge l'utilisateur connecté
        return this.authService.loadUser();
      })
    ).subscribe({
      next: (user) => {
        this.isLoading = false;
        if (user?.role === 'ADMIN') {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.router.navigate(['/home/accueil']);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.globalError = err.error?.message ?? 'Email ou mot de passe incorrect.';
      }
    });
  }

  clearError(field: string): void {
    delete this.errors[field];
    this.globalError = '';
  }

}
