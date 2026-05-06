import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  constructor(private authService: AuthService, private router: Router){}

  form = {
    nomComplet: '',
    email:     '',
    phone:     '',
    password:  '',
    confirm:   '',
    terms:     false,
  };

  errors: Record<string, string> = {};
  globalError  = '';
  isLoading    = false;
  showPassword = false;
  showConfirm  = false;
  focusedField = '';
  success      = false;

  // ── Password strength ────────────────────────────────
  strength      = 0;
  strengthLabel = '';
  strengthClass = '';

  onPasswordInput(): void {
    this.clearError('password');
    const p = this.form.password;
    let score = 0;
    if (p.length >= 8)            score++;
    if (/[A-Z]/.test(p))          score++;
    if (/[0-9]/.test(p))          score++;
    if (/[^A-Za-z0-9]/.test(p))   score++;

    this.strength = score;

    const map: Record<number, [string, string]> = {
      0: ['',          ''],
      1: ['Faible',    'weak'],
      2: ['Moyen',     'medium'],
      3: ['Bon',       'good'],
      4: ['Excellent', 'strong'],
    };
    [this.strengthLabel, this.strengthClass] = map[score];
  }

  // ── Validation ───────────────────────────────────────
  onRegister(): void {
    this.errors      = {};
    this.globalError = '';
    this.success     = false;

    if (!this.form.nomComplet.trim())
      this.errors['firstName'] = 'Le prénom est requis.';

    if (!this.form.email)
      this.errors['email'] = 'L\'email est requis.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.form.email))
      this.errors['email'] = 'Email invalide.';

    if (!this.form.phone.trim())
      this.errors['phone'] = 'Le téléphone est requis.';

    if (!this.form.password)
      this.errors['password'] = 'Le mot de passe est requis.';
    else if (this.form.password.length < 6)
      this.errors['password'] = 'Minimum 6 caractères.';

    if (!this.form.confirm)
      this.errors['confirm'] = 'Veuillez confirmer le mot de passe.';
    else if (this.form.confirm !== this.form.password)
      this.errors['confirm'] = 'Les mots de passe ne correspondent pas.';

    if (!this.form.terms)
      this.errors['terms'] = 'Vous devez accepter les conditions.';

    if (Object.keys(this.errors).length > 0) return;

    this.isLoading = true;

    // Simulation appel API
    setTimeout(() => {
      this.isLoading = false;
      this.success   = true;
      console.log('Register:', this.form);
      this.authService.register(this.form).subscribe(
        
      );
      this.router.navigate(['/login']);
    }, 1500);
  }

  clearError(field: string): void {
    delete this.errors[field];
    this.globalError = '';
  }
}