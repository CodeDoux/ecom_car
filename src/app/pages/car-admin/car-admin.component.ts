import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CarService } from '../../services/car.service';
import { Car } from '../../models/car';
import { Categorie } from '../../models/categorie';
import { CategorieService } from '../../services/categorie.service';
import { environment } from '../../../environments/environment';


@Component({
  selector: 'app-car-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './car-admin.component.html',
  styleUrl: './car-admin.component.scss'
})
export class CarAdminComponent {

  storageUrl = environment.storageUrl;
  constructor(private carService: CarService, private categorieService: CategorieService){}
  // ── Data ─────────────────────────────────────────────
  /*allCars: Car[] = [
    { id: 1, name: 'Toyota Land Cruiser Prado', category: 'SUV',     price: 52000, year: 2022, fuel: 'Diesel', mileage: '35k km', transmission: 'Auto',   image: 'images/Toyota_Land_Cruiser_Prado.jpg', status: 'used' },
    { id: 2, name: 'Mercedes-Benz C300',        category: 'Berline', price: 45000, year: 2023, fuel: 'Petrol', mileage: '10k km', transmission: 'Auto',   image: 'images/Mercedes-Benz_C300.jpg',        status: 'new'  },
    { id: 3, name: 'Hyundai Tucson',            category: 'SUV',     price: 32000, year: 2022, fuel: 'Petrol', mileage: '20k km', transmission: 'Auto',   image: 'images/Hyundai_Tucson.jpg',            status: 'used' },
    { id: 4, name: 'Toyota Hilux',              category: 'Pickup',  price: 40000, year: 2023, fuel: 'Diesel', mileage: '5k km',  transmission: 'Manual', image: 'images/Toyota_Hilux.jpg',              status: 'new'  },
    { id: 5, name: 'BMW X5',                    category: 'SUV',     price: 68000, year: 2024, fuel: 'Petrol', mileage: '2k km',  transmission: 'Auto',   image: 'images/BMW_X5.jpg',                    status: 'new'  },
    { id: 6, name: 'Kia Sportage',              category: 'SUV',     price: 30000, year: 2021, fuel: 'Petrol', mileage: '40k km', transmission: 'Auto',   image: 'images/Kia_Sportage.jpg',              status: 'used' },
    { id: 7, name: 'Ford Ranger',               category: 'Pickup',  price: 38000, year: 2022, fuel: 'Diesel', mileage: '18k km', transmission: 'Manual', image: 'images/Ford_Ranger.jpg',               status: 'used' },
    { id: 8, name: 'Audi A4',                   category: 'Berline', price: 47000, year: 2023, fuel: 'Petrol', mileage: '7k km',  transmission: 'Auto',   image: 'images/Audi_A4.jpg',                   status: 'new'  },
  ];*/

  allCars: Car[]=[];

  filteredCars: Car[]  = [];
  paginatedCars: Car[] = [];

  // ── Filters ───────────────────────────────────────────
  searchQuery    = '';
  statusFilter   = '';
  categoryFilter = '';
  sortBy         = 'default';
  categories: Categorie[] = [];

  // ── View ──────────────────────────────────────────────
  viewMode: 'table' | 'grid' = 'table';

  // ── Selection ─────────────────────────────────────────
  selectedIds: number[] = [];
  get allSelected(): boolean {
    return this.paginatedCars.length > 0 &&
           this.paginatedCars.every(c => this.selectedIds.includes(c.id));
  }

  // ── Pagination ────────────────────────────────────────
  currentPage  = 1;
  itemsPerPage = 6;
  get totalPages(): number { return Math.ceil(this.filteredCars.length / this.itemsPerPage); }
  get pageNumbers(): number[] { return Array.from({ length: this.totalPages }, (_, i) => i + 1); }

  // ── Modal add/edit ────────────────────────────────────
  showModal  = false;
  modalMode: 'add' | 'edit' = 'add';
  isSaving   = false;
  editingCar: Car | null = null;
  formErrors: { [key: string]: string } = {};

  modalForm: { [key: string]: any } = {
    nom: '', category_id: '', prix: null, annee: null, model: '',marque: '', couleur: '',
    carburant: '', transmission: '', kilometrage: '', status: 'nouveau', description: ''
  };

  // Propriétés à ajouter dans la classe
  carImages: any[]  = [];       // images existantes (mode edit)
  newFiles:  File[] = [];       // fichiers à uploader
  previews:  string[] = [];     // aperçus base64

  // ── Modal delete ──────────────────────────────────────
  showDeleteModal = false;
  isDeleting      = false;
  carToDelete: Car | null = null;

  // ── Toast ─────────────────────────────────────────────
  toast = { show: false, message: '', type: 'success' };
  private toastTimer: any;

  // ── Lifecycle ─────────────────────────────────────────
  ngOnInit(): void {
    //this.categories = [...new Set(this.allCars.map(c => c.categorie))].sort();
    this.loadCars();
    this.loadCategories();
  }

  loadCategories(): void {
    //this.isLoadingCategories = true;
    this.categorieService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
       // this.isLoadingCategories = false;
      },
      error: (err) => {
        console.log('Erreur lors du chargement des catégories.');
        //this.isLoadingCategories = false;
        console.error(err);
      }
    });
  }

  loadCars(): void {
  this.carService.getCars().subscribe({
    next: (data) => {
      this.allCars   = data;
      this.filteredCars=this.allCars;
      console.log(this.allCars);
     // this.categories = [...new Set(data.map(c => c.category_id.toString()))].sort();
      this.applyFilters();
    },
    error: () => this.showToast('Erreur lors du chargement.', 'error')
  });
}

getImageUrl(image: string): string {
  return `${image}`;
}

  // ── Filters ───────────────────────────────────────────
  setStatus(s: string): void { this.statusFilter = s; this.currentPage = 1; this.applyFilters(); }

  applyFilters(): void {
    let result = [...this.allCars];

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(c => c.nom.toLowerCase().includes(q) || c.categorie?.name.toLowerCase().includes(q));
    }
    if (this.statusFilter)   result = result.filter(c => c.status === this.statusFilter);
    if (this.categoryFilter) result = result.filter(c => c.categorie?.name === this.categoryFilter);

    switch (this.sortBy) {
      case 'price-asc':  result.sort((a, b) => a.prix - b.prix); break;
      case 'price-desc': result.sort((a, b) => b.prix - a.prix); break;
      case 'year-desc':  result.sort((a, b) => b.annee  - a.annee);  break;
      case 'name':       result.sort((a, b) => a.nom.localeCompare(b.nom)); break;
    }

    this.filteredCars = result;
    this.paginate();
  }

  // ── Pagination ────────────────────────────────────────
  paginate(): void {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedCars = this.filteredCars.slice(start, start + this.itemsPerPage);
  }

  goToPage(p: number): void {
    if (p < 1 || p > this.totalPages) return;
    this.currentPage = p;
    this.paginate();
  }

  // ── Selection ─────────────────────────────────────────
  toggleSelect(id: number): void {
    const i = this.selectedIds.indexOf(id);
    i === -1 ? this.selectedIds.push(id) : this.selectedIds.splice(i, 1);
  }

  toggleSelectAll(e: Event): void {
    const checked = (e.target as HTMLInputElement).checked;
    this.selectedIds = checked ? this.paginatedCars.map(c => c.id) : [];
  }

  // ── Modal add/edit ────────────────────────────────────
  openModal(mode: 'add' | 'edit', car?: Car): void {
     this.modalMode   = mode;
  this.formErrors  = {};
  this.newFiles    = [];
  this.previews    = [];
  this.carImages   = [];
  this.showModal   = true;
  document.body.style.overflow = 'hidden';

  if (mode === 'edit' && car) {
    this.editingCar = car;
   // Mapper explicitement chaque champ
  this.modalForm = {
    nom:          car.nom,
    category_id:  car.category_id ?? (car as any).category?.id,  // ← gère les deux cas
    marque:       car.marque,
    model:        car.model,
    annee:        car.annee,
    prix:         car.prix,
    kilometrage:  car.kilometrage,
    carburant:    car.carburant,
    transmission: car.transmission,
    couleur:      car.couleur,
    description:  car.description ?? '',
    status:       car.status ?? 'nouveau',
  };
  console.log('modalForm category_id:', this.modalForm['category_id']); // ← debug
    // ← Charger les images existantes depuis l'API
    this.carService.getImages(car.id).subscribe({
      next: (images) => {
        this.carImages = images;
      },
      error: () => this.showToast('Erreur chargement des images.', 'error')
    });
  } else {
    this.editingCar = null;
    this.modalForm  = {
      nom: '', category_id: '', marque: '', model: '',
      annee: null, prix: null, kilometrage: '',
      carburant: '', transmission: '', couleur: '',
      description: '', status: 'nouveau'
    };
  }
  }

  closeModal(): void {
    this.showModal = false;
    document.body.style.overflow = '';
  }

  onImageChange(event: Event): void {
    const files = Array.from((event.target as HTMLInputElement).files || []);
  files.forEach(file => {
    this.newFiles.push(file);
    const reader = new FileReader();
    reader.onload = () => this.previews.push(reader.result as string);
    reader.readAsDataURL(file);
  });
  }
removePreview(index: number): void {
  this.newFiles.splice(index, 1);
  this.previews.splice(index, 1);
}

removeExistingImage(img: any): void {
  this.carService.deleteImage(img.id).subscribe({
    next: () => this.carImages = this.carImages.filter(i => i.id !== img.id),
    error: () => this.showToast('Erreur suppression image.', 'error')
  });
}

setPrimaryImage(img: any): void {
  this.carService.setPrimary(img.id).subscribe({
    next: () => {
      this.carImages.forEach(i => i.is_primary = false);
      img.is_primary = true;
      this.showToast('Image principale définie.', 'success');
    },
    error: () => this.showToast('Erreur.', 'error')
  });
}
  validateForm(): boolean {
    this.formErrors = {};
    if (!this.modalForm['nom']?.trim())     this.formErrors['nom']     = 'Requis';
    if (!this.modalForm['category_id'])         this.formErrors['category_id'] = 'Requis';
    if (!this.modalForm['prix'])            this.formErrors['prix']    = 'Requis';
    if (!this.modalForm['annee'])             this.formErrors['annee']     = 'Requis';
    return Object.keys(this.formErrors).length === 0;
  }

  onSave(): void {
  if (!this.validateForm()) return alert('formulaire invalide');
  this.isSaving = true;

   const formData = new FormData();

  // Champs texte
  formData.append('nom',          this.modalForm['nom']);
  formData.append('category_id',  String(this.modalForm['category_id']));
  formData.append('marque',       this.modalForm['marque']);
  formData.append('model',        this.modalForm['model']);
  formData.append('annee',        String(this.modalForm['annee']));
  formData.append('prix',         String(this.modalForm['prix']));
  formData.append('kilometrage',  String(this.modalForm['kilometrage']));
  formData.append('carburant',    this.modalForm['carburant']);
  formData.append('transmission', this.modalForm['transmission']);
  formData.append('couleur',      this.modalForm['couleur']);
  formData.append('description',  this.modalForm['description'] ?? '');
  formData.append('status',       this.modalForm['status']);

  // Images
  this.newFiles.forEach(file => {
    formData.append('images[]', file);
  });
  console.log(formData);
  if (this.modalMode === 'add') {
    this.carService.createCar(formData).subscribe({
      next: (car) => {
       // this.allCars.unshift(car);
       // this.categories = categories.map(c => c.name);
       // Upload images si présentes
        this.isSaving = false;
        this.closeModal();
        this.applyFilters();
        this.showToast('Véhicule ajouté avec succès !', 'success');
      },
      error: (err) => {
        this.isSaving = false;
        console.log(err?.error?.message);
        this.showToast(err?.error?.message ?? 'Erreur lors de l\'ajout.', 'error');
      }
    });

  } else if (this.editingCar) {
    console.log(this.modalForm['category_id']);
    this.carService.updateCar(this.editingCar.id, formData).subscribe({
      next: (updated) => {
        const idx = this.allCars.findIndex(c => c.id === this.editingCar!.id);
        if (idx !== -1) this.allCars[idx] = updated;
        // Upload nouvelles images si présentes
        if (this.newFiles.length > 0) {
          this.carService.uploadImages(this.editingCar!.id, this.newFiles).subscribe();
        }
        this.isSaving = false;
        this.closeModal();
        this.applyFilters();
        this.showToast('Véhicule modifié avec succès !', 'success');
      },
      error: (err) => {
        this.isSaving = false;
        console.log(err?.error?.message ?? 'Erreur lors de la modification.', 'error');
        this.showToast(err?.error?.message ?? 'Erreur lors de la modification.', 'error');
      }
    });
  }
}
  // ── Delete ────────────────────────────────────────────
  confirmDelete(car: Car): void {
    this.carToDelete    = car;
    this.showDeleteModal = true;
    document.body.style.overflow = 'hidden';
  }

  deleteCar(): void {
  if (!this.carToDelete) return;
  this.isDeleting = true;

  this.carService.deleteCar(this.carToDelete.id).subscribe({
    next: () => {
      this.allCars         = this.allCars.filter(c => c.id !== this.carToDelete!.id);
      this.showDeleteModal = false;
      this.isDeleting      = false;
      this.carToDelete     = null;
      document.body.style.overflow = '';
      this.applyFilters();
      this.showToast('Véhicule supprimé.', 'success');
    },
    error: (err) => {
      this.isDeleting = false;
      this.showToast(err?.error?.message ?? 'Erreur lors de la suppression.', 'error');
    }
  });
}

  deleteSelected(): void {
    this.allCars = this.allCars.filter(c => !this.selectedIds.includes(c.id));
    this.selectedIds = [];
    this.applyFilters();
    this.showToast(`${this.selectedIds.length} véhicule(s) supprimé(s).`, 'success');
  }

  // ── Toast ─────────────────────────────────────────────
  showToast(message: string, type: 'success' | 'error'): void {
    clearTimeout(this.toastTimer);
    this.toast = { show: true, message, type };
    this.toastTimer = setTimeout(() => this.toast.show = false, 3000);
  }

  // Fermer modal avec Escape
  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeModal();
    this.showDeleteModal = false;
    document.body.style.overflow = '';
  }
}
