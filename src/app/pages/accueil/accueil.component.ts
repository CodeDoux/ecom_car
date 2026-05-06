import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CarService } from '../../services/car.service';
import { Car } from '../../models/car';
import { SettingService } from '../../services/setting.service';
import { Router, RouterModule } from '@angular/router';
import { CategorieService } from '../../services/categorie.service';
import { Categorie } from '../../models/categorie';
import { environment } from '../../../environments/environment';

/*export interface Car {
  id: number;
  name: string;
  category: string;
  price: number;
  year: number;
  fuel: string;
  mileage: string;
  transmission: string;
  image: string;
  status: 'new' | 'used';
}*/

export interface Brand {
  name: string;
  logo: string;
}

@Component({
  selector: 'app-accueil',
  standalone: true,
  imports: [CommonModule, FormsModule,RouterModule],
  templateUrl: './accueil.component.html',
  styleUrls: ['./accueil.component.scss']
})
export class AccueilComponent implements OnInit {

  storageUrl = environment.storageUrl;
  constructor(private carService: CarService,private router: Router,private settingService: SettingService, private categoryService: CategorieService){}

  @HostListener('document:keydown.escape')
   onEscape(): void { this.closeModal(); }
   
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
  // ── Navbar ─────────────────────────────────────────
  isScrolled  = false;
  isMenuOpen  = false;

  // ── Hero search bar ─────────────────────────────────
  filterTabs    = ['All Cars', 'Used Car', 'New Cars'];
  activeFilterTab = 'All Cars';
  selectedMake  = '';
  selectedModel = '';
  priceMin      = 1000;
  priceMax      = 5000;
  totalCars     = 2351;

  // ── Brands ─────────────────────────────────────────
 brands:      string[] = [];
 selectedBrand: string | null = null;
 /* brands: Brand[] = [
    { name: 'Acura',    logo: 'images/acura.jpg' },
    { name: 'Ford',     logo: 'images/ford.jpg' },
    { name: 'Bentley',  logo: 'images/bentley.jpg' },
    { name: 'Chevrolet',logo: 'images/chevrolet.jpg' },
    { name: 'Ferrari',  logo: 'images/ferrari.jpg' },
    { name: 'Mercedes', logo: 'images/mercedes.jpg' },
  ];*/

  // Map des logos par marque (URLs CDN publiques)
private readonly brandLogos: Record<string, string> = {
  'Toyota':     'https://logo.clearbit.com/toyota.com',
  'Mercedes':   'https://logo.clearbit.com/mercedes-benz.com',
  'BMW':        'https://logo.clearbit.com/bmw.com',
  'Audi':       'https://logo.clearbit.com/audi.com',
  'Volkswagen': 'https://logo.clearbit.com/volkswagen.com',
  'Honda':      'https://logo.clearbit.com/honda.com',
  'Ford':       'https://logo.clearbit.com/ford.com',
  'Hyundai':    'https://logo.clearbit.com/hyundai.com',
  'Kia':        'https://logo.clearbit.com/kia.com',
  'Nissan':     'https://logo.clearbit.com/nissan.com',
  'Renault':    'https://logo.clearbit.com/renault.com',
  'Peugeot':    'https://logo.clearbit.com/peugeot.com',
  'Chevrolet':  'https://logo.clearbit.com/chevrolet.com',
  'Lexus':      'https://logo.clearbit.com/lexus.com',
  'Land Rover': 'https://logo.clearbit.com/landrover.com',
  'Jeep':       'https://logo.clearbit.com/jeep.com',
  'Porsche':    'https://logo.clearbit.com/porsche.com',
  'Ferrari':    'https://logo.clearbit.com/ferrari.com',
  'Lamborghini':'https://logo.clearbit.com/lamborghini.com',
  'Maserati':   'https://logo.clearbit.com/maserati.com',
  'Mitsubishi': 'https://logo.clearbit.com/mitsubishi.com',
  'Subaru':     'https://logo.clearbit.com/subaru.com',
  'Volvo':      'https://logo.clearbit.com/volvocars.com',
  'Mazda':      'https://logo.clearbit.com/mazda.com',
  'Suzuki':     'https://logo.clearbit.com/suzuki.com',
};

// Méthode pour récupérer le logo
getBrandLogo(brand: string): string {
  return this.brandLogos[brand] ?? '';
}

// Initiale de la marque (fallback si pas de logo)
getBrandInitial(brand: string): string {
  return brand.charAt(0).toUpperCase();
}

brandImgErrors: Record<string, boolean> = {};
  
onBrandImgError(event: Event, brand: string): void {
  this.brandImgErrors[brand] = true;
}
hasBrandImgError(brand: string): boolean {
  return this.brandImgErrors[brand] === true;
}


buildFilterOptions(): void {
  this.brands = [...new Set(
    this.allCars.map(c => c.marque).filter(Boolean)
  )].sort();
}
  // ── Vehicles ────────────────────────────────────────
  vehicleTabs       = ['All Status', 'New Cars', 'Used Cars'];
  activeVehicleTab  = 'All Status';
  allCars: Car[]=[];


 /* allCars: Car[] = [
  { id: 1, name: 'Toyota Land Cruiser Prado', category: 'SUV', price: 52000, year: 2022, fuel: 'Diesel', mileage: '35k km', transmission: 'Auto', image: 'images/Toyota_Land_Cruiser_Prado.jpg', status: 'used'},
  { id: 2, name: 'Mercedes-Benz C300', category: 'Berline', price: 45000, year: 2023, fuel: 'Petrol', mileage: '10k km', transmission: 'Auto', image: 'images/Mercedes-Benz_C300.jpg', status: 'new'},
  { id: 3, name: 'Hyundai Tucson', category: 'SUV', price: 32000, year: 2022,fuel: 'Petrol', mileage: '20k km', transmission: 'Auto', image: 'images/Hyundai_Tucson.jpg', status: 'used'},
  { id: 4, name: 'Toyota Hilux', category: 'Pickup', price: 40000, year: 2023, fuel: 'Diesel', mileage: '5k km', transmission: 'Manual', image: 'images/Toyota_Hilux.jpg', status: 'new'},
  { id: 5, name: 'BMW X5', category: 'SUV', price: 68000, year: 2024, fuel: 'Petrol', mileage: '2k km', transmission: 'Auto', image: 'images/BMW_X5.jpg', status: 'new'},
  { id: 6, name: 'Kia Sportage', category: 'SUV', price: 30000, year: 2021, fuel: 'Petrol', mileage: '40k km', transmission: 'Auto', image: 'images/Kia_Sportage.jpg', status: 'used'},
  { id: 7, name: 'Ford Ranger', category: 'Pickup',price: 38000, year: 2022,fuel: 'Diesel',mileage: '18k km',transmission: 'Manual',image: 'images/Ford_Ranger.jpg',status: 'used'},
  { id: 8, name: 'Audi A4',category: 'Berline',price: 47000,year: 2023,fuel: 'Petrol',mileage: '7k km',transmission: 'Auto', image: 'images/Audi_A4.jpg',status: 'new'}
];*/

// ── Best sellers ──────────────────────────────────────
bestSellers: { name: string; price: number; image: string }[] = [];

activeSlide  = 0;
isPlaying    = true;
private carouselTimer: any;


ngOnDestroy(): void {
  this.stopCarousel();
}

startCarousel(): void {
  if (!this.bestSellers.length) return;
  this.carouselTimer = setInterval(() => {
    this.nextSlide();
  }, 3500);
}

stopCarousel(): void {
 if (this.carouselTimer) {
    clearInterval(this.carouselTimer);
  }}

toggleCarousel(): void {
  this.isPlaying = !this.isPlaying;
  this.isPlaying ? this.startCarousel() : this.stopCarousel();
}

nextSlide(): void {
  if (!this.bestSellers.length) return;
  this.activeSlide = (this.activeSlide + 1) % this.bestSellers.length;
}

prevSlide(): void {
  if (!this.bestSellers.length) return;
  this.activeSlide = (this.activeSlide - 1 + this.bestSellers.length) % this.bestSellers.length;
}

goToSlide(index: number): void {
  if (!this.bestSellers.length) return;
  this.activeSlide = index;
}
  filteredCars: Car[] = [];
  settings: Record<string, string> = {};

  // ── Lifecycle ───────────────────────────────────────
  ngOnInit(): void {
    this.filteredCars = [...this.allCars];
      this.startCarousel();
      this.loadCars();
      
      this.settingService.load().subscribe(() => {
    this.settings = this.settingService['settingsSubject'].getValue();
    console.log(this.settings);
    this.loadBestSellersFromSettings();
  });
  
 
  }

  // Ajoute index aux services
services = [
  { index: 1, icon: 'fa-right-left',  title: 'Échange de Voiture',        description: 'Échangez votre véhicule actuel contre un autre de notre catalogue. Estimation gratuite et rapide.', color: '#1E6FFF', bg: 'rgba(30,111,255,.1)'  },
  { index: 2, icon: 'fa-palette',     title: 'Personnalisation',           description: 'Changement de couleur, carrosserie, intérieur et pièces mécaniques selon vos envies.',          color: '#8b5cf6', bg: 'rgba(139,92,246,.1)' },
  { index: 3, icon: 'fa-gears',       title: 'Vente de Pièces Détachées',  description: 'Large stock de pièces d\'origine et compatibles pour toutes les marques disponibles.',          color: '#f59e0b', bg: 'rgba(245,158,11,.1)'  },
  { index: 4, icon: 'fa-shower',      title: 'Lavage Général',             description: 'Nettoyage intérieur et extérieur complet, polish, traitement céramique et lustrage.',            color: '#10b981', bg: 'rgba(16,185,129,.1)'  },
];

  
toast = { show: false, message: '', type: 'success' };
private toastTimer: any;

loadCars(): void {
  this.carService.getCars().subscribe({
    next: (data) => {
      this.allCars      = data;
      this.filteredCars = data.slice(0, 6); // ← seulement 6 voitures
      console.log(this.filteredCars);
      this.buildFilterOptions();
    },
    error: () => this.showToast('Erreur lors du chargement.', 'error')
  });
}
 showToast(message: string, type: 'success' | 'error'): void {
    clearTimeout(this.toastTimer);
    this.toast = { show: true, message, type };
    this.toastTimer = setTimeout(() => this.toast.show = false, 3000);
  }

  getImageUrl(image: string): string {
  return `${image}`;
}
  // ── Scroll ──────────────────────────────────────────
  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    this.isScrolled = window.scrollY > 20;
  }

  // ── Methods ─────────────────────────────────────────
  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  setFilterTab(tab: string): void {
    this.activeFilterTab = tab;
  }

  onPriceChange(): void {
    // Could dynamically update totalCars based on filter
  }

  onSearchCars(): void {
    console.log('Search:', { make: this.selectedMake, model: this.selectedModel, priceMax: this.priceMax });
    // TODO: navigate to fleet page with query params
  }

  loadBestSellersFromSettings(): void {
  this.bestSellers = [1, 2, 3]
    .map(i => ({
      name:  this.settings[`bestseller_name${i}`]  || `Best Seller ${i}`,
      price: parseFloat(this.settings[`bestseller_price${i}`] || '0'),
      image: this.settings[`bestseller_image${i}`] || '',
    }))
    .filter(b => b.image !== ''); // ← n'affiche que ceux qui ont une image
    if (this.bestSellers.length > 0) {
    this.isPlaying = true;
    this.startCarousel();
  }
    console.log(this.bestSellers);
}

  goToListing(): void {
    this.router.navigate(['/home/all-cars']);
  }

  filterByBrand(brand: string): void {
    this.selectedBrand = this.selectedBrand === brand ? null : brand;
    this.router.navigate(['home/all-cars']);
  }

  setVehicleTab(tab: string): void {
    this.activeVehicleTab = tab;
    if (tab === 'All Status') {
      this.filteredCars = [...this.allCars];
    } else if (tab === 'New Cars') {
      this.filteredCars = this.allCars.filter(c => c.status === 'new');
    } else {
      this.filteredCars = this.allCars.filter(c => c.status === 'used');
    }
  }

  
nextModalImage(): void {
  if (!this.selectedCar) return;
  this.modalImageIndex = (this.modalImageIndex + 1) % this.selectedCar.images!.length;
}

prevModalImage(): void {
  if (!this.selectedCar) return;
  this.modalImageIndex = (this.modalImageIndex - 1 + this.selectedCar.images!.length) % this.selectedCar.images!.length;
}
}