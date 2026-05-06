import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user';
import { environment } from '../../../environments/environment';


@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-admin.component.html',
  styleUrls: ['./user-admin.component.scss']
})
export class UserAdminComponent implements OnInit {

  private readonly API = 'http://localhost:8000/api';

  // ── Data ─────────────────────────────────────────────
  users:          User[] = [];
  filteredUsers:  User[] = [];
  paginatedUsers: User[] = [];

  // ── Filters ───────────────────────────────────────────
  searchQuery = '';
  roleFilter  = '';
  sortBy      = 'date-desc';
  viewMode: 'table' | 'grid' = 'table';

  // ── Pagination ────────────────────────────────────────
  currentPage  = 1;
  itemsPerPage = 8;
  get totalPages(): number { return Math.ceil(this.filteredUsers.length / this.itemsPerPage); }
  get pageNumbers(): number[] { return Array.from({ length: this.totalPages }, (_, i) => i + 1); }

  // ── Modals ────────────────────────────────────────────
  showDetail      = false;
  showRoleModal   = false;
  showDeleteModal = false;
  selectedUser:  User | null = null;
  userToDelete:  User | null = null;
  newRole        = 'user';
  isSaving       = false;
  isDeleting     = false;

  // ── Avatar colors ─────────────────────────────────────
  private avatarColors = ['#1E6FFF','#10b981','#f59e0b','#8b5cf6','#ef4444','#ec4899','#06b6d4'];

  // ── Toast ─────────────────────────────────────────────
  toast = { show: false, message: '', type: 'success' };
  private toastTimer: any;

  constructor(private userService: UserService) {}

  storageUrl = environment.storageUrl;
  ngOnInit(): void { this.loadUsers(); }

  // ── Load ──────────────────────────────────────────────
  loadUsers(): void {
  this.userService.getAll().subscribe({
    next: (data) => {
      this.users = data;
      console.log(this.users);
      this.applyFilters();
    },
    error: () => this.showToast('Erreur lors du chargement.', 'error')
  });
}

  // ── Filters ───────────────────────────────────────────
  setRole(r: string): void { this.roleFilter = r; this.currentPage = 1; this.applyFilters(); }

  applyFilters(): void {
    let result = [...this.users];

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(u =>
        u.nomComplet?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q)
      );
    }

    if (this.roleFilter) {
      result = result.filter(u => u.role === this.roleFilter);
    }

    switch (this.sortBy) {
      case 'date-desc':       result.sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime()); break;
      case 'date-asc':        result.sort((a, b) => new Date(a.created_at!).getTime() - new Date(b.created_at!).getTime()); break;
      case 'name':            result.sort((a, b) => (a.nomComplet).localeCompare(b.nomComplet)); break;
      case 'commandes-desc':  result.sort((a, b) => (b.commandes_count ?? 0) - (a.commandes_count ?? 0)); break;
    }

    this.filteredUsers = result;
    this.paginate();
  }

  // ── Pagination ────────────────────────────────────────
  paginate(): void {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedUsers = this.filteredUsers.slice(start, start + this.itemsPerPage);
  }

  goToPage(p: number): void {
    if (p < 1 || p > this.totalPages) return;
    this.currentPage = p;
    this.paginate();
  }

  // ── Stats ─────────────────────────────────────────────
  getRoleCount(role: string): number {
    return this.users.filter(u => u.role === role).length;
  }

  getActiveCount(): number {
    return this.users.filter(u => (u.commandes_count ?? 0) > 0).length;
  }

  // ── Avatar color ──────────────────────────────────────
  getAvatarColor(user: User): string {
    return this.avatarColors[user.id! % this.avatarColors.length];
  }

  // ── Status label ─────────────────────────────────────
  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      en_cours:  'En cours',
      confirmee: 'Confirmée',
      livree:    'Livrée',
      annulee:   'Annulée',
    };
    return map[status] ?? status;
  }

  // ── Modals ────────────────────────────────────────────
  openDetail(user: User): void {
  this.userService.getById(user.id!).subscribe({
    next: (data) => {
      this.selectedUser = data;
      this.showDetail   = true;
      document.body.style.overflow = 'hidden';
    },
    error: () => {
      this.selectedUser = user;
      this.showDetail   = true;
      document.body.style.overflow = 'hidden';
    }
  });
}

  openRoleModal(user: User): void {
    this.selectedUser  = user;
    this.newRole       = user.role!;
    this.showRoleModal = true;
    document.body.style.overflow = 'hidden';
  }

  confirmDelete(user: User): void {
    if (user.role === 'admin') return;
    this.userToDelete   = user;
    this.showDeleteModal = true;
    document.body.style.overflow = 'hidden';
  }

  // ── Update role ───────────────────────────────────────
  updateRole(): void {
  if (!this.selectedUser) return;
  this.isSaving = true;

  this.userService.updateRole(this.selectedUser.id!, this.newRole).subscribe({
    next: () => {
      const idx = this.users.findIndex(u => u.id === this.selectedUser!.id);
      if (idx !== -1) this.users[idx].role = this.newRole;
      this.isSaving      = false;
      this.showRoleModal = false;
      document.body.style.overflow = '';
      this.applyFilters();
      this.showToast('Rôle mis à jour.', 'success');
    },
    error: (err) => {
      this.isSaving = false;
      this.showToast(err?.error?.message ?? 'Erreur.', 'error');
    }
  });
}
  // ── Delete ────────────────────────────────────────────
  deleteUser(): void {
  if (!this.userToDelete) return;
  this.isDeleting = true;

  this.userService.delete(this.userToDelete.id!).subscribe({
    next: () => {
      this.users           = this.users.filter(u => u.id !== this.userToDelete!.id);
      this.showDeleteModal = false;
      this.isDeleting      = false;
      this.userToDelete    = null;
      document.body.style.overflow = '';
      this.applyFilters();
      this.showToast('Utilisateur supprimé.', 'success');
    },
    error: (err) => {
      this.isDeleting = false;
      this.showToast(err?.error?.message ?? 'Erreur lors de la suppression.', 'error');
    }
  });
}

  // ── Toast ─────────────────────────────────────────────
  showToast(message: string, type: 'success' | 'error'): void {
    clearTimeout(this.toastTimer);
    this.toast = { show: true, message, type };
    this.toastTimer = setTimeout(() => this.toast.show = false, 3000);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.showDetail      = false;
    this.showRoleModal   = false;
    this.showDeleteModal = false;
    document.body.style.overflow = '';
  }
}