import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface CertificateData {
  first_name: string;
  last_name: string;
  age_of_camper: string;
  country: string;
  state: string;
  camp_type: 'manantial' | 'verbo' | 'crossworlds';
}

@Component({
  selector: 'app-certificate',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './certificate.html',
})
export class CertificateComponent {
  @Input() camper!: CertificateData;

  getCampName(type: string): string {
    const names: Record<string, string> = {
      manantial: 'Fountain of Life Camp',
      verbo: 'Word Camp',
      crossworlds: 'CrossWorlds Connections Camp',
    };
    return names[type] || type;
  }

  getChurchName(type: string): string {
    const names: Record<string, string> = {
      manantial: 'Iglesia Manantial de Vida',
      verbo: 'Iglesia del Verbo',
      crossworlds: 'CrossWorlds Connections',
    };
    return names[type] || type;
  }

  getCampYear(): string {
    return new Date().getFullYear().toString();
  }

  getCampDate(): string {
    const now = new Date();
    return now.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
}
