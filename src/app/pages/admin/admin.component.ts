import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LOCALE_ID } from '@angular/core';
import { environment } from '../../../environments/environment';


interface Notification {
  message: string;
  time: string;
  type: 'blue' | 'green' | 'orange';
  icon: string;
}

@Component({
  selector: 'app-admin',
  standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent {

  storageUrl = environment.storageUrl;
  constructor(
    private authService: AuthService, private router: Router
  ){}

closeMobileSidebar(): void {
  this.mobileMenuOpen = false;
}

  // ── Sidebar ─────────────────────────────────────────
  isCollapsed    = false;
  mobileMenuOpen = false;

  // ── Topbar ───────────────────────────────────────────
  searchQuery    = '';
  showNotifs     = false;
  showProfileMenu = false;

  notifications: Notification[] = [
    { message: 'Nouvelle commande #1042 reçue',    time: 'Il y a 5 min',   type: 'blue',   icon: 'fa-clipboard-list' },
    { message: 'Voiture BMW X5 ajoutée',           time: 'Il y a 20 min',  type: 'green',  icon: 'fa-car' },
    { message: 'Utilisateur signalé : John D.',    time: 'Il y a 1h',      type: 'orange', icon: 'fa-user' },
    { message: 'Nouvelle commande #1041 reçue',    time: 'Il y a 2h',      type: 'blue',   icon: 'fa-clipboard-list' },
  ];

  // ── Methods ──────────────────────────────────────────
  toggleCollapse(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  toggleMobileSidebar(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  toggleNotifs(): void {
    this.showNotifs = !this.showNotifs;
    this.showProfileMenu = false;
  }

  toggleProfileMenu(): void {
    this.showProfileMenu = !this.showProfileMenu;
    this.showNotifs = false;
  }

  markAllRead(): void {
    this.showNotifs = false;
  }

  // Ferme les dropdowns si clic extérieur
  @HostListener('document:click', ['$event'])
  onDocumentClick(e: Event): void {
    const target = e.target as HTMLElement;
    if (!target.closest('.topbar-icon-btn') && !target.closest('.notif-dropdown')) {
      this.showNotifs = false;
    }
    if (!target.closest('.admin-profile') && !target.closest('.profile-dropdown')) {
      this.showProfileMenu = false;
    }
  }

  logout(): void {
   if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      this.authService.logoutApi().subscribe({
    next: () => {
      this.authService.logout(); // puis nettoyer localement
      
    },
    error: () => {
      // Même en cas d'erreur API, nettoyer localement
      this.authService.logout();
    }
    
  });
    }
  }
}
