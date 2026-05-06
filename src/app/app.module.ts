import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AccueilComponent } from './pages/accueil/accueil.component';
import { AllCarsComponent } from './pages/all-cars/all-cars.component';
import { AdminComponent } from './pages/admin/admin.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { HTTP_INTERCEPTORS, HttpClientModule, provideHttpClient, withInterceptors } from '@angular/common/http';
import { CarAdminComponent } from './pages/car-admin/car-admin.component';
import { CategorieComponent } from './pages/categorie/categorie.component';
import { CategorieAdminComponent } from './pages/categorie-admin/categorie-admin.component';
import { ContactComponent } from './pages/contact/contact.component';
import { CommandeAdminComponent } from './pages/commande-admin/commande-admin.component';
import { UserAdminComponent } from './pages/user-admin/user-admin.component';
import { AdminSettingComponent } from './pages/admin-setting/admin-setting.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ErrorInterceptor } from './core/interceptors/error.interceptor';
import { ApiInterceptor } from './core/interceptors/api.interceptor';

@NgModule({
  declarations: [
    AppComponent,
     ],
  imports: [
     BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    CommonModule,
    RouterModule,

    // ← Composants standalone s'importent ici
    AdminComponent,
    AccueilComponent,
    AllCarsComponent,
    ContactComponent,
    LoginComponent,
    RegisterComponent,
    CarAdminComponent,
    CategorieAdminComponent,
    CommandeAdminComponent,
    UserAdminComponent,
    AdminSettingComponent,
    
  ],
  providers: [
    //Enregistrer ApiInterceptor
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ApiInterceptor,
      multi: true
    },
    // Enregistrer ErrorInterceptor
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true
    }

  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
