import { Component, Input, inject, signal, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CertificateGeneratorService,
  CertificateGeneratorConfig,
  GeneratedCertificate,
} from '../../services/certificate-generator.service';

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
export class CertificateComponent implements AfterViewInit {
  @Input() camper!: CertificateData;

  /** Whether to show image-based certificate (true) or HTML certificate (false) */
  @Input() useImageCertificate = false;

  /** Custom configuration for image certificate */
  @Input() imageConfig?: Partial<CertificateGeneratorConfig>;

  @ViewChild('certificatePreview') previewContainer?: ElementRef<HTMLDivElement>;

  private certificateGenerator = inject(CertificateGeneratorService);

  /** Signal for loading state */
  isLoading = signal(false);

  /** Signal for generated certificate */
  generatedCertificate = signal<GeneratedCertificate | null>(null);

  /** Signal for error messages */
  errorMessage = signal<string | null>(null);

  ngAfterViewInit(): void {
    if (this.useImageCertificate && this.camper) {
      this.generateImageCertificate();
    }
  }

  /**
   * Generates an image-based certificate
   */
  async generateImageCertificate(): Promise<void> {
    if (!this.camper) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const fullName = `${this.camper.first_name} ${this.camper.last_name}`;
      const certificate = await this.certificateGenerator.generateCertificate({
        fullName,
        ...this.imageConfig,
      });

      this.generatedCertificate.set(certificate);

      // Display preview if container exists
      if (this.previewContainer?.nativeElement) {
        const img = document.createElement('img');
        img.src = certificate.dataUrl;
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
        img.alt = `Certificado de ${fullName}`;
        this.previewContainer.nativeElement.innerHTML = '';
        this.previewContainer.nativeElement.appendChild(img);
      }
    } catch (error) {
      console.error('Error generating certificate:', error);
      this.errorMessage.set('Error al generar el certificado. Por favor, intente de nuevo.');
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Downloads the generated image certificate
   */
  downloadImageCertificate(): void {
    const certificate = this.generatedCertificate();
    if (certificate) {
      this.certificateGenerator.downloadCertificate(certificate);
    }
  }

  /**
   * Gets the full name formatted
   */
  getFullName(): string {
    if (!this.camper) return '';
    return `${this.camper.first_name} ${this.camper.last_name}`;
  }

  getCampName(type: string): string {
    const names: Record<string, string> = {
      manantial: 'Campamento Manantial de Vida',
      verbo: 'Campamento del Verbo',
      crossworlds: 'Campamento CrossWorlds Connections',
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
    return now.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
}
