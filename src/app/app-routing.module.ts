
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccueilComponent } from './pages/accueil/accueil.component';
import { AllCarsComponent } from './pages/all-cars/all-cars.component';
import { HomeComponent } from './pages/accueil/home.component';
import { AdminDashboardComponent } from './pages/admin/admin-dashboard.component';
import { authGuard } from './core/guard/auth.guard';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { AdminComponent } from './pages/admin/admin.component';
import { CarAdminComponent } from './pages/car-admin/car-admin.component';
import { CategorieAdminComponent } from './pages/categorie-admin/categorie-admin.component';
import { ContactComponent } from './pages/contact/contact.component';
import { CommandeAdminComponent } from './pages/commande-admin/commande-admin.component';
import { UserAdminComponent } from './pages/user-admin/user-admin.component';
import { AdminSettingComponent } from './pages/admin-setting/admin-setting.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
 // { path: '**', redirectTo: 'home', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'home',
    component: HomeComponent,
    children: [
       { path: '', component: AccueilComponent },
       { path: 'all-cars', component: AllCarsComponent },
       { path: 'contact', component: ContactComponent },
    ]
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    component: AdminComponent,
    children: [
       { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'cars', component: CarAdminComponent },
      { path: 'categories', component: CategorieAdminComponent },
      { path: 'commandes', component: CommandeAdminComponent },
      { path: 'users', component: UserAdminComponent },
      { path: 'settings', component: AdminSettingComponent },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
