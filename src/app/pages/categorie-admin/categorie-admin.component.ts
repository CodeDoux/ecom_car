import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CategorieService } from '../../services/categorie.service';
import { Categorie } from '../../models/categorie';
import { environment } from '../../../environments/environment';

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  carCount: number;
  active: boolean;
}

@Component({
  selector: 'app-categorie-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './categorie-admin.component.html',
  styleUrl: './categorie-admin.component.scss'
})
export class CategorieAdminComponent implements OnInit{

  storageUrl = environment.storageUrl;
    constructor(private categoryService: CategorieService) {}
  // ── Data ─────────────────────────────────────────────
  /*categories: Category[] = [
    { id: 1, name: 'SUV',       slug: 'suv',       description: 'Véhicules tout-terrain spacieux et polyvalents.',   icon: 'fa-truck-monster', color: '#1E6FFF', carCount: 18, active: true  },
    { id: 2, name: 'Berline',   slug: 'berline',   description: 'Voitures élégantes à coffre séparé.',              icon: 'fa-car',           color: '#10b981', carCount: 11, active: true  },
    { id: 3, name: 'Pickup',    slug: 'pickup',    description: 'Camionnettes robustes à plateau découvert.',        icon: 'fa-truck',         color: '#f59e0b', carCount: 7,  active: true  },
    { id: 4, name: 'Coupé',     slug: 'coupe',     description: 'Véhicules sportifs à deux portes.',                icon: 'fa-car-side',      color: '#8b5cf6', carCount: 5,  active: true  },
    { id: 5, name: 'Citadine',  slug: 'citadine',  description: 'Petites voitures idéales pour la ville.',          icon: 'fa-car-rear',      color: '#ef4444', carCount: 7,  active: false },
  ];*/

  filteredCategories: Categorie[] = [];
  categories: Categorie[]=[];

  // ── Filters ───────────────────────────────────────────
  searchQuery = '';
  sortBy      = 'default';
  viewMode: 'grid' | 'table' = 'grid';

  // ── Icon options ──────────────────────────────────────
  iconOptions = [
    { value: 'fa-car',           label: '🚗 Voiture'         },
    { value: 'fa-car-side',      label: '🚗 Voiture côté'    },
    { value: 'fa-car-rear',      label: '🚗 Voiture arrière' },
    { value: 'fa-truck',         label: '🚛 Camion'          },
    { value: 'fa-truck-monster', label: '🚙 Monster truck'   },
    { value: 'fa-bus',           label: '🚌 Bus'             },
    { value: 'fa-motorcycle',    label: '🏍️ Moto'            },
    { value: 'fa-taxi',          label: '🚕 Taxi'            },
    { value: 'fa-van-shuttle',   label: '🚐 Fourgon'         },
    { value: 'fa-layer-group',   label: '📦 Général'         },
  ];

  // ── Color presets ─────────────────────────────────────
  colorPresets = ['#1E6FFF', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#ec4899', '#06b6d4', '#84cc16'];

  // ── Modal ─────────────────────────────────────────────
  showModal   = false;
  modalMode: 'add' | 'edit' = 'add';
  isSaving    = false;
  editingCat: Categorie | null = null;
  formErrors: { [key: string]: string } = {};

  modalForm: { [key: string]: any } = this.emptyForm();

  // ── Delete ────────────────────────────────────────────
  showDeleteModal = false;
  isDeleting      = false;
  catToDelete: Categorie | null = null;

  // ── Toast ─────────────────────────────────────────────
  toast = { show: false, message: '', type: 'success' };
  private toastTimer: any;

  // ── Lifecycle ─────────────────────────────────────────
  ngOnInit(): void {
      this.loadCategories();
      //.applyFilters();
    }

  loadCategories(): void {
  this.categoryService.getCategories().subscribe({
    next: (data) => {
      this.categories = data;
      this.applyFilters();
    },
    error: () => this.showToast('Erreur lors du chargement.', 'error')
  });
}

  // ── Helpers ───────────────────────────────────────────
  emptyForm(): { [key: string]: any } {
    return { name: '', slug: '', description: '', icon: 'fa-car', color: '#1E6FFF', active: true };
  }

  // ── Filters ───────────────────────────────────────────
  applyFilters(): void {
    let result = [...this.categories];

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) 
            );
    }

    switch (this.sortBy) {
      case 'name':       result.sort((a, b) => a.name.localeCompare(b.name)); break;
      //case 'count-desc': result.sort((a, b) => b.carCount - a.carCount);      break;
      //case 'count-asc':  result.sort((a, b) => a.carCount - b.carCount);      break;
    }

    this.filteredCategories = result;
  }

  // ── Slug auto-génération ──────────────────────────────
  generateSlug(): void {
    this.modalForm['slug'] = this.modalForm['name']
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
  }

  // ── Toggle active ─────────────────────────────────────
  toggleActive(cat: Categorie): void {
    cat.active = !cat.active;
    this.showToast(`Catégorie ${cat.active ? 'activée' : 'désactivée'}.`, 'success');
    // TODO: appel API
  }

  // ── Modal ─────────────────────────────────────────────
  openModal(mode: 'add' | 'edit', cat?: Categorie): void {
    this.modalMode  = mode;
    this.formErrors = {};
    this.showModal  = true;
    document.body.style.overflow = 'hidden';

    if (mode === 'edit' && cat) {
      this.editingCat = cat;
      this.modalForm  = { ...cat };
    } else {
      this.editingCat = null;
      this.modalForm  = this.emptyForm();
    }
  }

  closeModal(): void {
    this.showModal = false;
    document.body.style.overflow = '';
  }

  validateForm(): boolean {
    this.formErrors = {};
    if (!this.modalForm['name']?.trim()) this.formErrors['name'] = 'Le nom est requis.';
    return Object.keys(this.formErrors).length === 0;
  }

 onSave(): void {
  if (!this.validateForm()) return;
  this.isSaving = true;

  const payload = {
  name:        this.modalForm['name'],
  description: this.modalForm['description'],
};

  if (this.modalMode === 'add') {
    this.categoryService.createCategory(payload).subscribe({
      next: (cat) => {
        this.categories.unshift(cat);
        this.isSaving = false;
        this.closeModal();
        this.applyFilters();
        this.showToast('Catégorie créée avec succès !', 'success');
      },
      error: (err) => {
        this.isSaving = false;
        this.showToast(err?.error?.message ?? 'Erreur lors de la création.', 'error');
      }
    });

  } else if (this.editingCat) {
    this.categoryService.updateCategory(this.editingCat.id, payload).subscribe({
      next: (updated) => {
        const idx = this.categories.findIndex(c => c.id === this.editingCat!.id);
        if (idx !== -1) this.categories[idx] = updated;
        this.isSaving = false;
        this.closeModal();
        this.applyFilters();
        this.showToast('Catégorie modifiée avec succès !', 'success');
      },
      error: (err) => {
        this.isSaving = false;
        this.showToast(err?.error?.message ?? 'Erreur lors de la modification.', 'error');
      }
    });
  }
}

deleteCategory(): void {
  if (!this.catToDelete) return;
  this.isDeleting = true;

  this.categoryService.deleteCategory(this.catToDelete.id).subscribe({
    next: () => {
      this.categories      = this.categories.filter(c => c.id !== this.catToDelete!.id);
      this.showDeleteModal = false;
      this.isDeleting      = false;
      this.catToDelete     = null;
      document.body.style.overflow = '';
      this.applyFilters();
      this.showToast('Catégorie supprimée.', 'success');
    },
    error: (err) => {
      this.isDeleting = false;
      this.showToast(err?.error?.message ?? 'Erreur lors de la suppression.', 'error');
    }
  });
}
  // ── Delete ────────────────────────────────────────────
  confirmDelete(cat: Categorie): void {
    this.catToDelete     = cat;
    this.showDeleteModal = true;
    document.body.style.overflow = 'hidden';
  }

  // ── Toast ─────────────────────────────────────────────
  showToast(message: string, type: 'success' | 'error'): void {
    clearTimeout(this.toastTimer);
    this.toast = { show: true, message, type };
    this.toastTimer = setTimeout(() => this.toast.show = false, 3000);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeModal();
    this.showDeleteModal = false;
    document.body.style.overflow = '';
  }
}
