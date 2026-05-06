import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CarService } from '../../services/car.service';
import { Car } from '../../models/car';
import { environment } from '../../../environments/environment';
import { SettingService } from '../../services/setting.service';
import { CategorieService } from '../../services/categorie.service';
import { Categorie } from '../../models/categorie';





interface Filters {
  status:       string;
  categories:   string[];
  brands:       string[];
  fuels:        string[];
  transmission: string;
  maxPrice:     number;
  minYear:      number;
}

@Component({
  selector: 'app-all-cars',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './all-cars.component.html',
  styleUrls: ['./all-cars.component.scss']
})
export class AllCarsComponent implements OnInit {

  settings: Record<string, string> = {};
  storageUrl = environment.storageUrl;

  @HostListener('document:keydown.escape')
   onEscape(): void { this.closeModal(); }

   constructor(private carService: CarService, private settingService: SettingService, private categorieService: CategorieService){}

  selectedCar: Car | null = null;
  modalImageIndex = 0;

openModal(car: Car): void {
  this.selectedCar = car;
  this.modalImageIndex  = 0;
  document.body.style.overflow = 'hidden';
}

closeModal(): void {
  this.selectedCar = null;
  document.body.style.overflow = '';
}
  // ── Data ────────────────────────────────────────────
 /* allCars: Car[] = [
    { id: 1, name: 'Toyota Land Cruiser Prado', category: 'SUV',    price: 50000000, year: 2022, fuel: 'Diesel', mileage: '35k km', transmission: 'Auto',   image: 'images/Toyota_Land_Cruiser_Prado.jpg', status: 'used' },
    { id: 2, name: 'Mercedes-Benz C300',        category: 'Berline', price: 45000000, year: 2023, fuel: 'Petrol', mileage: '10k km', transmission: 'Auto',   image: 'images/Mercedes-Benz_C300.jpg',        status: 'new'  },
    { id: 3, name: 'Hyundai Tucson',            category: 'SUV',    price: 30000000, year: 2022, fuel: 'Petrol', mileage: '20k km', transmission: 'Auto',   image: 'images/Hyundai_Tucson.jpg',            status: 'used' },
    { id: 4, name: 'Toyota Hilux',              category: 'Pickup', price: 38000000, year: 2023, fuel: 'Diesel', mileage: '5k km',  transmission: 'Manual', image: 'images/Toyota_Hilux.jpg',              status: 'new'  },
    { id: 5, name: 'BMW X5',                    category: 'SUV',    price: 60000000, year: 2024, fuel: 'Petrol', mileage: '2k km',  transmission: 'Auto',   image: 'images/BMW_X5.jpg',                    status: 'new'  },
    { id: 6, name: 'Kia Sportage',              category: 'SUV',    price: 21000000, year: 2021, fuel: 'Petrol', mileage: '40k km', transmission: 'Auto',   image: 'images/Kia_Sportage.jpg',              status: 'used' },
    { id: 7, name: 'Ford Ranger',               category: 'Pickup', price: 32000000, year: 2022, fuel: 'Diesel', mileage: '18k km', transmission: 'Manual', image: 'images/Ford_Ranger.jpg',               status: 'used' },
    { id: 8, name: 'Audi A4',                   category: 'Berline', price: 40000000, year: 2023, fuel: 'Petrol', mileage: '7k km',  transmission: 'Auto',   image: 'images/Audi_A4.jpg',                   status: 'new'  },
  ];*/

  filteredCars: Car[] = [];
  allCars: Car[]=[];

  // ── Filter options (générés dynamiquement) ───────────
  categories:  Categorie[] = [];
  brands:      string[] = [];
  fuels:       string[] = [];
  years:       number[] = [];
  priceRange = { min: 0, max: 0 };

  filters: Filters = {
    status:       '',
    categories:   [],
    brands:       [],
    fuels:        [],
    transmission: '',
    maxPrice:     0,
    minYear:      0,
  };

  sortBy   = 'default';
  viewMode: 'grid' | 'list' = 'grid';
  sidebarOpen = false;

  // ── Lifecycle ────────────────────────────────────────
  ngOnInit(): void {
    this.loadCars();
    this.settingService.load().subscribe(() => {
    this.settings = this.settingService['settingsSubject'].getValue();
  });
  }

  getImageUrl(image: string): string {
  // Si l'image est déjà une URL complète
  if (image.startsWith('http')) return image;
  
  // Sinon ajoute le storageUrl
  return `${this.storageUrl}${image}`;
}

contacterVendeur(car: Car):void{
  const tel= this.settings['contact_phone1'];
  const msg     = encodeURIComponent(
          `Bonjour je voulez plus d'informations concernant cette voiture ${car},\n\nFélicitations ! 🎉\n` +
          `Nom : ${car.nom} ` +
          `Annee: ${car.annee}.\n\n` +
          `Marque :${car.marque}.\n\n`
        );
        window.open(`https://wa.me/221${tel}?text=${msg}`, '_blank');
}
 buildFilterOptions(): void {
  // Catégories depuis l'objet imbriqué categorie
  this.categorieService.getCategories().subscribe({
    next: (data) => {
      this.categories = data;
    },
  });

  // Carburants
  this.fuels = [...new Set(
    this.allCars.map(c => c.carburant).filter(Boolean)
  )].sort();

  // Années
  this.years = [...new Set(
    this.allCars.map(c => c.annee).filter(Boolean)
  )].sort((a, b) => a - b);

  // Marques depuis le champ marque (pas le premier mot du nom)
  this.brands = [...new Set(
    this.allCars.map(c => c.marque).filter(Boolean)
  )].sort();

  // Prix min/max
  const prices = this.allCars.map(c => c.prix).filter(Boolean);
  this.priceRange = {
    min: Math.min(...prices),
    max: Math.max(...prices),
  };
  this.filters.maxPrice = this.priceRange.max;
}

  // ── Filter setters ───────────────────────────────────
  setStatus(s: string): void          { this.filters.status = s;       this.applyFilters(); }
  setTransmission(t: string): void    { this.filters.transmission = t;  this.applyFilters(); }
  setMinYear(y: number): void         { this.filters.minYear = this.filters.minYear === y ? 0 : y; this.applyFilters(); }
  resetPrice(): void                  { this.filters.maxPrice = this.priceRange.max; this.applyFilters(); }

  toggleCategory(cat: Categorie): void {
  const i = this.filters.categories.indexOf(cat.name);
  i === -1
    ? this.filters.categories.push(cat.name)
    : this.filters.categories.splice(i, 1);
  this.applyFilters();
}

  toggleBrand(brand: string): void {
    const i = this.filters.brands.indexOf(brand);
    i === -1 ? this.filters.brands.push(brand) : this.filters.brands.splice(i, 1);
    this.applyFilters();
  }

  toggleFuel(fuel: string): void {
    const i = this.filters.fuels.indexOf(fuel);
    i === -1 ? this.filters.fuels.push(fuel) : this.filters.fuels.splice(i, 1);
    this.applyFilters();
  }

  loadCars(): void {
  this.carService.getCars().subscribe({
    next: (data) => {
      this.allCars = data;
      this.buildFilterOptions(); // ← après avoir les données
      this.applyFilters();       // ← puis filtrer
    },
    error: () => this.showToast('Erreur lors du chargement.', 'error')
  });
}

toast = { show: false, message: '', type: 'success' };
private toastTimer: any;

showToast(message: string, type: 'success' | 'error'): void {
    clearTimeout(this.toastTimer);
    this.toast = { show: true, message, type };
    this.toastTimer = setTimeout(() => this.toast.show = false, 3000);
  }
  applyFilters(): void {
  let result = [...this.allCars];

  if (this.filters.status)
    result = result.filter(c => c.status === this.filters.status);

  if (this.filters.categories.length)
    result = result.filter(c =>
      c.categorie?.name && this.filters.categories.includes(c.categorie.name)
    );

  // Filtre sur le champ marque directement
  if (this.filters.brands.length)
    result = result.filter(c =>
      c.marque && this.filters.brands.includes(c.marque)
    );

  if (this.filters.fuels.length)
    result = result.filter(c =>
      this.filters.fuels.includes(c.carburant)
    );

  if (this.filters.transmission)
    result = result.filter(c => c.transmission === this.filters.transmission);

  if (this.filters.maxPrice > 0)
    result = result.filter(c => c.prix <= this.filters.maxPrice);

  if (this.filters.minYear > 0)
    result = result.filter(c => c.annee >= this.filters.minYear);

  // Sort
  switch (this.sortBy) {
    case 'price-asc':  result.sort((a, b) => a.prix - b.prix);             break;
    case 'price-desc': result.sort((a, b) => b.prix - a.prix);             break;
    case 'year-desc':  result.sort((a, b) => b.annee - a.annee);           break;
    case 'year-asc':   result.sort((a, b) => a.annee - b.annee);           break;
    case 'name':       result.sort((a, b) => a.nom.localeCompare(b.nom));  break;
  }

  this.filteredCars = result;
}

  // ── Reset ────────────────────────────────────────────
 resetFilters(): void {
  this.filters = {
    status:       '',
    categories:   [],
    brands:       [],
    fuels:        [],
    transmission: '',
    maxPrice:     this.priceRange.max,
    minYear:      0,
  };
  this.sortBy = 'default';
  this.applyFilters();
}

  // Counts pour les checkboxes
getCategoryCount(cat: Categorie): number {
  return this.allCars.filter(c => c.categorie?.name === cat.name).length;
}

  getBrandCount(brand: string): number {
  return this.allCars.filter(c => c.marque === brand).length;
}

  // ── UI ───────────────────────────────────────────────
  get activeFilterCount(): number {
    return (this.filters.status ? 1 : 0)
      + this.filters.categories.length
      + this.filters.brands.length
      + this.filters.fuels.length
      + (this.filters.transmission ? 1 : 0)
      + (this.filters.maxPrice < this.priceRange.max ? 1 : 0)
      + (this.filters.minYear > 0 ? 1 : 0);
  }

  setView(mode: 'grid' | 'list'): void { this.viewMode = mode; }
  toggleSidebar(): void                { this.sidebarOpen = !this.sidebarOpen; }

  


nextModalImage(): void {
  if (!this.selectedCar) return;
  this.modalImageIndex = (this.modalImageIndex + 1) % this.selectedCar.images!.length;
}

prevModalImage(): void {
  if (!this.selectedCar) return;
  this.modalImageIndex = (this.modalImageIndex - 1 + this.selectedCar.images!.length) % this.selectedCar.images!.length;
}
}