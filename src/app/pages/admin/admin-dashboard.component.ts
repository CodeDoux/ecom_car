import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

interface KPI {
  label:   string;
  value:   string;
  trend:   string;
  trendUp: boolean;
  icon:    string;
  color:   string;
}

interface ChartData {
  month:  string;
  value:  number;
  active: boolean;
}

interface DonutSegment {
  label:  string;
  count:  number;
  color:  string;
  dash:   string;
  offset: string;
}

interface RecentOrder {
  id:           number;
  client:       string;
  vehicle:      string;
  amount:       number;
  status:       string;
}

interface TopCar {
  name:     string;
  category: string;
  price:    number;
  image:    string;
  count:    number;  // nb de fois commandé
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminDashboardComponent implements OnInit {

  storageUrl = environment.storageUrl;
   apiUrl = environment.apiUrl;

  today      = new Date();
  isLoading  = true;

  // ── KPIs ─────────────────────────────────────────────
  kpis: KPI[] = [];

  // ── Raw counters ──────────────────────────────────────
  totalCars      = 0;
  totalCommandes = 0;
  totalUsers     = 0;
  totalRevenue   = 0;

  // ── Bar chart ─────────────────────────────────────────
  chartPeriod    = '6m';
  chartData:     ChartData[] = [];
  maxChartValue  = 0;
  yAxis:         string[] = [];
  allChartData:  Record<string, ChartData[]> = { '6m': [], '1y': [] };

  // ── Donut chart ───────────────────────────────────────
  donutSegments: DonutSegment[] = [];
  private rawSegments: { label: string; count: number; color: string }[] = [];
  private donutColors = ['#1E6FFF', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#ec4899'];

  // ── Recent orders ─────────────────────────────────────
  recentOrders: RecentOrder[] = [];

  // ── Top cars ──────────────────────────────────────────
  topCars: TopCar[] = [];

  constructor(private http: HttpClient) {}

  // ── Lifecycle ─────────────────────────────────────────
  ngOnInit(): void {
    this.loadDashboard();
  }

  // ── Load all data ─────────────────────────────────────
  

loadDashboard(): void {
  this.isLoading = true;

  forkJoin({
    cars:       this.http.get<any[]>(`${this.apiUrl}/cars`).pipe(catchError(() => of([]))),
    commandes:  this.http.get<any[]>(`${this.apiUrl}/commandes`).pipe(catchError(() => of([]))),
    users:      this.http.get<any[]>(`${this.apiUrl}/users`).pipe(catchError(() => of([]))),
    categories: this.http.get<any[]>(`${this.apiUrl}/categories`).pipe(catchError(() => of([]))),
  }).subscribe({
    next: ({ cars, commandes, users, categories }) => {
      console.log('cars:', cars.length);
      console.log('commandes:', commandes.length);
      console.log('users:', users.length);
      console.log('categories:', categories.length);

      this.buildKPIs(cars, commandes, users);
      this.buildChart(commandes);
      this.buildDonut(cars, categories);
      this.buildRecentOrders(commandes);
      this.buildTopCars(cars, commandes);
      this.isLoading = false;
    },
    error: () => { this.isLoading = false; }
  });
}

  // ── KPIs ──────────────────────────────────────────────
  buildKPIs(cars: any[], commandes: any[], users: any[]): void {
    this.totalCars      = cars.length;
    this.totalCommandes = commandes.filter(c => c.status !== 'annulee').length;
    this.totalUsers     = users.length;
    this.totalRevenue   = commandes
      .filter(c => c.status === 'livree' || c.status === 'confirmee')
      .reduce((sum, c) => sum + Number(c.montant_total), 0);

    this.kpis = [
      {
        label:   'Revenus totaux',
        value:   this.formatCurrency(this.totalRevenue),
        trend:   this.totalRevenue > 0 ? '+actif' : '0',
        trendUp: true,
        icon:    'fa-dollar-sign',
        color:   '#1E6FFF',
      },
      {
        label:   'Véhicules en stock',
        value:   String(this.totalCars),
        trend:   `${this.totalCars} total`,
        trendUp: true,
        icon:    'fa-car',
        color:   '#10b981',
      },
      {
        label:   'Commandes actives',
        value:   String(this.totalCommandes),
        trend:   `${commandes.filter(c => c.status === 'en_cours').length} en cours`,
        trendUp: true,
        icon:    'fa-clipboard-list',
        color:   '#f59e0b',
      },
      {
        label:   'Utilisateurs',
        value:   String(this.totalUsers),
        trend:   `${this.totalUsers} inscrits`,
        trendUp: true,
        icon:    'fa-users',
        color:   '#8b5cf6',
      },
    ];
  }

  // ── Chart ─────────────────────────────────────────────
  buildChart(commandes: any[]): void {
    const monthNames = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];

    // Grouper les revenus par mois (année courante)
    const currentYear = new Date().getFullYear();
    const monthlyRevenue: Record<number, number> = {};

    commandes
      .filter(c => {
        const year = new Date(c.created_at).getFullYear();
        return year === currentYear && (c.status === 'livree' || c.status === 'confirmee');
      })
      .forEach(c => {
        const month = new Date(c.created_at).getMonth(); // 0-11
        monthlyRevenue[month] = (monthlyRevenue[month] ?? 0) + Number(c.montant_total);
      });

    // Données 12 mois
    const fullYear: ChartData[] = monthNames.map((month, i) => ({
      month,
      value:  monthlyRevenue[i] ?? 0,
      active: i === new Date().getMonth(),
    }));

    // Données 6 derniers mois
    const currentMonth = new Date().getMonth();
    const last6: ChartData[] = [];
    for (let i = 5; i >= 0; i--) {
      const idx = (currentMonth - i + 12) % 12;
      last6.push({ ...fullYear[idx], active: i === 0 });
    }

    this.allChartData = { '6m': last6, '1y': fullYear };
    this.setChartPeriod('6m');
  }

  setChartPeriod(period: string): void {
    this.chartPeriod   = period;
    this.chartData     = this.allChartData[period];
    this.maxChartValue = Math.max(...this.chartData.map(d => d.value), 1);
    const step = Math.ceil(this.maxChartValue / 4 / 10000) * 10000 || 10000;
    this.yAxis = Array.from({ length: 5 }, (_, i) => {
      const v = step * (4 - i);
      return v >= 1000 ? `${v / 1000}k Fr` : `${v} Fr`;
    });
  }

  // ── Donut ─────────────────────────────────────────────
  buildDonut(cars: any[], categories: any[]): void {
    // Compter les voitures par catégorie
    const countByCategory: Record<string, number> = {};
    cars.forEach(car => {
      const catName = car.categorie?.name ?? 'Autre';
      countByCategory[catName] = (countByCategory[catName] ?? 0) + 1;
    });

    this.rawSegments = categories
      .filter(cat => countByCategory[cat.name] > 0)
      .map((cat, i) => ({
        label: cat.name,
        count: countByCategory[cat.name] ?? 0,
        color: this.donutColors[i % this.donutColors.length],
      }));

    // Ajouter "Autre" si des voitures sans catégorie
    if (countByCategory['Autre'] > 0) {
      this.rawSegments.push({
        label: 'Autre',
        count: countByCategory['Autre'],
        color: this.donutColors[this.rawSegments.length % this.donutColors.length],
      });
    }

    this.totalCars = cars.length;
    this.computeDonutSegments();
  }

  computeDonutSegments(): void {
    const circumference = 2 * Math.PI * 50;
    let offsetAcc = 0;
    this.donutSegments = this.rawSegments.map(s => {
      const pct    = s.count / this.totalCars;
      const dash   = `${pct * circumference} ${circumference}`;
      const offset = `${-offsetAcc * circumference}`;
      offsetAcc   += pct;
      return { ...s, dash, offset };
    });
  }

  // ── Recent orders ─────────────────────────────────────
  buildRecentOrders(commandes: any[]): void {
    this.recentOrders = commandes
      .slice(0, 5)
      .map(c => ({
        id:      c.id,
        client:  `${c.user?.firstName ?? ''} ${c.user?.lastName ?? ''}`.trim(),
        vehicle: c.ligne_commandes?.[0]?.car?.nom ?? '—',
        amount:  Number(c.montant_total),
        status:  c.status,
      }));
  }

  // ── Top cars ──────────────────────────────────────────
  buildTopCars(cars: any[], commandes: any[]): void {
    // Compter nb de commandes par voiture
    const carCount: Record<number, number> = {};
    commandes.forEach(cmd => {
      cmd.ligne_commandes?.forEach((l: any) => {
        carCount[l.car_id] = (carCount[l.car_id] ?? 0) + 1;
      });
    });

    this.topCars = cars
      .map(car => ({
        name:     car.nom,
        category: car.categorie?.name ?? '—',
        price:    Number(car.prix),
        image:    car.images?.[0]?.chemin
                    ? `http://localhost:8000/storage/${car.images[0].chemin}`
                    : '',
        count:    carCount[car.id] ?? 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  // ── Status helpers ────────────────────────────────────
  statusLabel(status: string): string {
    const map: Record<string, string> = {
      en_cours:  'En cours',
      confirmee: 'Confirmé',
      livree:    'Livré',
      annulee:   'Annulé',
    };
    return map[status] ?? status;
  }

  // ── Format currency ───────────────────────────────────
  formatCurrency(value: number): string {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M Fr`;
    if (value >= 1_000)     return `${(value / 1_000).toFixed(0)}k Fr`;
    return `${value} Fr`;
  }

  // ── Bar height ────────────────────────────────────────
  getBarHeight(value: number): number {
    if (this.maxChartValue === 0) return 0;
    return Math.round((value / this.maxChartValue) * 100);
  }

  // ── Top car max (pour la barre de popularité) ─────────
  get maxCarCount(): number {
    return Math.max(...this.topCars.map(c => c.count), 1);
  }
}