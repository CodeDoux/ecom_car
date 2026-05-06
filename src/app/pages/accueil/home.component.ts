import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive, RouterModule, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SettingService } from '../../services/setting.service';

export interface Car {
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
}

export interface Brand {
  name: string;
  logo: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule,RouterOutlet, RouterLink, RouterLinkActive,RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./accueil.component.scss']
})
export class HomeComponent implements OnInit {
  

  constructor(private authService: AuthService,
  private router: Router,private settingService: SettingService){}
  settings: Record<string, string> = {};

  // ── Navbar ─────────────────────────────────────────
  isScrolled  = false;
  isMenuOpen  = false;
  isLoggedIn   = false;
currentUser: any = null;
userMenuOpen = false;

  // ── Hero search bar ─────────────────────────────────
  filterTabs    = ['All Cars', 'Used Car', 'New Cars'];
  activeFilterTab = 'All Cars';
  selectedMake  = '';
  selectedModel = '';
  priceMin      = 1000;
  priceMax      = 5000;
  totalCars     = 2351;

  // ── Brands ─────────────────────────────────────────
  brands: Brand[] = [
    { name: 'Acura',    logo: 'images/acura.jpg' },
    { name: 'Ford',     logo: 'images/ford.jpg' },
    { name: 'Bentley',  logo: 'images/bentley.jpg' },
    { name: 'Chevrolet',logo: 'images/chevrolet.jpg' },
    { name: 'Ferrari',  logo: 'images/ferrari.jpg' },
    { name: 'Mercedes', logo: 'images/mercedes.jpg' },
  ];

  // ── Vehicles ────────────────────────────────────────
  vehicleTabs       = ['All Status', 'New Cars', 'Used Cars'];
  activeVehicleTab  = 'All Status';

  allCars: Car[] = [
  { id: 1, name: 'Toyota Land Cruiser Prado', category: 'SUV', price: 52000, year: 2022, fuel: 'Diesel', mileage: '35k km', transmission: 'Auto', image: 'images/Toyota_Land_Cruiser_Prado.jpg', status: 'used'},
  { id: 2, name: 'Mercedes-Benz C300', category: 'Berline', price: 45000, year: 2023, fuel: 'Petrol', mileage: '10k km', transmission: 'Auto', image: 'images/Mercedes-Benz_C300.jpg', status: 'new'},
  { id: 3, name: 'Hyundai Tucson', category: 'SUV', price: 32000, year: 2022,fuel: 'Petrol', mileage: '20k km', transmission: 'Auto', image: 'images/Hyundai_Tucson.jpg', status: 'used'},
  { id: 4, name: 'Toyota Hilux', category: 'Pickup', price: 40000, year: 2023, fuel: 'Diesel', mileage: '5k km', transmission: 'Manual', image: 'images/Toyota_Hilux.jpg', status: 'new'},
  { id: 5, name: 'BMW X5', category: 'SUV', price: 68000, year: 2024, fuel: 'Petrol', mileage: '2k km', transmission: 'Auto', image: 'images/BMW_X5.jpg', status: 'new'},
  { id: 6, name: 'Kia Sportage', category: 'SUV', price: 30000, year: 2021, fuel: 'Petrol', mileage: '40k km', transmission: 'Auto', image: 'images/Kia_Sportage.jpg', status: 'used'},
  { id: 7, name: 'Ford Ranger', category: 'Pickup',price: 38000, year: 2022,fuel: 'Diesel',mileage: '18k km',transmission: 'Manual',image: 'images/Ford_Ranger.jpg',status: 'used'},
  { id: 8, name: 'Audi A4',category: 'Berline',price: 47000,year: 2023,fuel: 'Petrol',mileage: '7k km',transmission: 'Auto', image: 'images/Audi_A4.jpg',status: 'new'}
];

  filteredCars: Car[] = [];

  // ── Lifecycle ───────────────────────────────────────
  ngOnInit(): void {
    this.filteredCars = [...this.allCars];
     if (this.authService.isAuthenticated()){
    this.authService.currentUser$.subscribe(user => {
    this.isLoggedIn  = !!user;
    this.currentUser = user;
    console.log('isLoggedIn:', this.isLoggedIn, 'user:', user);
  });
  }
   this.settingService.load().subscribe(() => {
    this.settings = this.settingService['settingsSubject'].getValue();
  });
  }

  toggleUserMenu(): void {
  this.userMenuOpen = !this.userMenuOpen;
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
  this.userMenuOpen = false;
  this.isLoggedIn=false;
      
    }
}

// Fermer le dropdown si clic en dehors
@HostListener('document:click', ['$event'])
onDocumentClick(e: Event): void {
  const target = e.target as HTMLElement;
  if (!target.closest('.nav-user')) {
    this.userMenuOpen = false;
  }
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
  mobileMenuOpen = false;
  toggleMobileMenu(): void { this.mobileMenuOpen = !this.mobileMenuOpen; }
  
}