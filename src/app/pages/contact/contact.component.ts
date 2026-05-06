import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { SettingService } from '../../services/setting.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent {

settings: Record<string, string> = {};

constructor(private settingService: SettingService) {}

  ngOnInit(): void {
  this.settingService.load().subscribe(() => {
    this.settings = this.settingService['settingsSubject'].getValue();
  });
}

getCleanPhone(phone: string): string {
  return phone.replace(/[\s\-\+]/g, '');
}

}
