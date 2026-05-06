import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment';

interface Setting {
  key:   string;
  label: string;
  group: string;
  type:  string;
  value: string;
}

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-setting.component.html',
  styleUrls: ['./admin-setting.component.scss']
})
export class AdminSettingComponent implements OnInit {
storageUrl = environment.storageUrl;
   API = environment.apiUrl;

  groups: Record<string, Setting[]> = {};
  activeGroup = 'hero';
  isSaving    = false;
  toast = { show: false, message: '', type: 'success' };
  private toastTimer: any;

  groupLabels: Record<string, { label: string; icon: string }> = {
    hero:        { label: 'Hero',           icon: 'fa-image'          },
    contact:     { label: 'Contact',        icon: 'fa-phone'          },
    social:      { label: 'Réseaux sociaux',icon: 'fa-share-nodes'    },
    bestseller:  { label: 'Best Sellers',   icon: 'fa-star'           },
    services:    { label: 'Services',       icon: 'fa-wrench'         },
    general:     { label: 'Général',        icon: 'fa-gear'           },
  };

  onImageUpload(event: Event, setting: any): void {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('image', file);

  this.http.post<any>(`${this.API}/upload`, formData).subscribe({
    next: (res) => {
      setting.value = this.storageUrl+'/'+res.url; // ← l'API retourne l'URL de l'image uploadée
    },
    error: () => this.showToast('Erreur lors de l\'upload.', 'error')
  });
}
  constructor(private http: HttpClient) {}

  ngOnInit(): void { this.loadSettings(); }

  loadSettings(): void {
    this.http.get<Record<string, Setting[]>>(`${this.API}/settings`).subscribe({
      next: (data) => { this.groups = data; },
      error: () => this.showToast('Erreur lors du chargement.', 'error')
    });
  }

  get currentSettings(): Setting[] {
    return this.groups[this.activeGroup] ?? [];
  }

  save(): void {
    this.isSaving = true;
    const settings = Object.values(this.groups)
      .flat()
      .map(s => ({ key: s.key, value: s.value }));

    this.http.put(`${this.API}/settings`, { settings }).subscribe({
      next: () => {
        this.isSaving = false;
        this.showToast('Paramètres sauvegardés avec succès !', 'success');
      },
      error: (err) => {
        this.isSaving = false;
        this.showToast(err?.error?.message ?? 'Erreur lors de la sauvegarde.', 'error');
      }
    });
  }

  showToast(message: string, type: 'success' | 'error'): void {
    clearTimeout(this.toastTimer);
    this.toast = { show: true, message, type };
    this.toastTimer = setTimeout(() => this.toast.show = false, 3000);
  }

  objectKeys(obj: any): string[] { return Object.keys(obj); }
}