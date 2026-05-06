import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { Commande } from '../../models/commande';
import { CommandeService } from '../../services/commande.service';
import { environment } from '../../../environments/environment';



@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './commande-admin.component.html',
  styleUrls: ['./commande-admin.component.scss']
})
export class CommandeAdminComponent implements OnInit {

  storageUrl = environment.storageUrl;
  private readonly API = 'http://localhost:8000/api';

  // ── Data ─────────────────────────────────────────────
  commandes:         Commande[] = [];
  filteredCommandes: Commande[] = [];
  paginatedCommandes: Commande[] = [];

  // ── Filters ───────────────────────────────────────────
  searchQuery  = '';
  statusFilter = '';
  sortBy       = 'date-desc';

  // ── Pagination ────────────────────────────────────────
  currentPage  = 1;
  itemsPerPage = 8;
  get totalPages(): number { return Math.ceil(this.filteredCommandes.length / this.itemsPerPage); }
  get pageNumbers(): number[] { return Array.from({ length: this.totalPages }, (_, i) => i + 1); }

  // ── Modals ────────────────────────────────────────────
  showDetail      = false;
  showStatusModal = false;
  showDeleteModal = false;
  selectedCmd:  Commande | null = null;
  cmdToDelete:  Commande | null = null;
  newStatus     = '';
  isSaving      = false;
  isDeleting    = false;

  // ── Status options ────────────────────────────────────
  statusOptions = [
    { value: 'en_cours',  label: 'En cours',  icon: 'fa-clock',        desc: 'Commande reçue, en attente de traitement.'  },
    { value: 'confirmee', label: 'Confirmée', icon: 'fa-circle-check',  desc: 'Commande confirmée et en préparation.'       },
    { value: 'livree',    label: 'Livrée',    icon: 'fa-truck',         desc: 'Commande livrée au client.'                  },
    { value: 'annulee',   label: 'Annulée',   icon: 'fa-xmark',         desc: 'Commande annulée.'                           },
  ];

  // ── Toast ─────────────────────────────────────────────
  toast = { show: false, message: '', type: 'success' };
  private toastTimer: any;

  constructor(private commandeService: CommandeService) {}

  ngOnInit(): void { this.loadCommandes(); }

  // ── Load ──────────────────────────────────────────────
  loadCommandes(): void {
  this.commandeService.getAll().subscribe({
    next: (data) => {
      this.commandes = data;
      this.applyFilters();
    },
    error: () => this.showToast('Erreur lors du chargement.', 'error')
  });
}

  // ── Filters ───────────────────────────────────────────
  setStatus(s: string): void { this.statusFilter = s; this.currentPage = 1; this.applyFilters(); }

  applyFilters(): void {
    let result = [...this.commandes];

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(c =>
        String(c.id).includes(q) ||
        c.user?.firstName?.toLowerCase().includes(q) ||
        c.user?.lastName?.toLowerCase().includes(q) ||
        c.user?.email?.toLowerCase().includes(q)
      );
    }

    if (this.statusFilter) {
      result = result.filter(c => c.status === this.statusFilter);
    }

    switch (this.sortBy) {
      case 'date-desc':    result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()); break;
      case 'date-asc':     result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()); break;
      case 'montant-desc': result.sort((a, b) => b.montant_total - a.montant_total); break;
      case 'montant-asc':  result.sort((a, b) => a.montant_total - b.montant_total); break;
    }

    this.filteredCommandes = result;
    this.paginate();
  }

  // ── Pagination ────────────────────────────────────────
  paginate(): void {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedCommandes = this.filteredCommandes.slice(start, start + this.itemsPerPage);
  }

  goToPage(p: number): void {
    if (p < 1 || p > this.totalPages) return;
    this.currentPage = p;
    this.paginate();
  }

  // ── Stats ─────────────────────────────────────────────
  getCount(status: string): number {
    return this.commandes.filter(c => c.status === status).length;
  }

  // ── Status helpers ────────────────────────────────────
  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      en_cours:  'En cours',
      confirmee: 'Confirmée',
      livree:    'Livrée',
      annulee:   'Annulée',
    };
    return map[status] ?? status;
  }

  getStatusIcon(status: string): string {
    const map: Record<string, string> = {
      en_cours:  'fa-clock',
      confirmee: 'fa-circle-check',
      livree:    'fa-truck',
      annulee:   'fa-xmark',
    };
    return map[status] ?? 'fa-circle';
  }

  // ── Modals ────────────────────────────────────────────
  openDetail(cmd: Commande): void {
    this.selectedCmd = cmd;
    this.showDetail  = true;
    document.body.style.overflow = 'hidden';
  }

  openStatusModal(cmd: Commande): void {
    this.selectedCmd      = cmd;
    this.newStatus        = cmd.status;
    this.showStatusModal  = true;
    document.body.style.overflow = 'hidden';
  }

  confirmDelete(cmd: Commande): void {
    this.cmdToDelete     = cmd;
    this.showDeleteModal = true;
    document.body.style.overflow = 'hidden';
  }

  // ── Update status ─────────────────────────────────────
  updateStatus(): void {
  if (!this.selectedCmd) return;
  this.isSaving = true;

  this.commandeService.updateStatus(this.selectedCmd.id, this.newStatus).subscribe({
    next: () => {
      const idx = this.commandes.findIndex(c => c.id === this.selectedCmd!.id);
      if (idx !== -1) this.commandes[idx].status = this.newStatus;
      this.isSaving        = false;
      this.showStatusModal = false;
      document.body.style.overflow = '';
      this.applyFilters();
      this.showToast('Statut mis à jour.', 'success');
    },
    error: (err) => {
      this.isSaving = false;
      this.showToast(err?.error?.message ?? 'Erreur.', 'error');
    }
  });
}
  // ── Delete ────────────────────────────────────────────
  deleteCommande(): void {
  if (!this.cmdToDelete) return;
  this.isDeleting = true;

  this.commandeService.delete(this.cmdToDelete.id).subscribe({
    next: () => {
      this.commandes       = this.commandes.filter(c => c.id !== this.cmdToDelete!.id);
      this.showDeleteModal = false;
      this.isDeleting      = false;
      this.cmdToDelete     = null;
      document.body.style.overflow = '';
      this.applyFilters();
      this.showToast('Commande supprimée.', 'success');
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
    this.showStatusModal = false;
    this.showDeleteModal = false;
    document.body.style.overflow = '';
  }
}