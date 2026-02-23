import { Injectable } from '@angular/core';

export interface CertificateGeneratorConfig {
  /** Full name to overlay on certificate */
  fullName: string;
  /** Optional: Custom Y position (percentage from top, default: 54) */
  yPositionPercent?: number;
  /** Optional: Font color (default: #1D2B53 - Dark Navy) */
  fontColor?: string;
  /** Optional: Font family (default: 'Georgia, serif') */
  fontFamily?: string;
  /** Optional: Max font size in pixels (default: 90) */
  maxFontSize?: number;
  /** Optional: Min font size in pixels (default: 40) */
  minFontSize?: number;
  /** Optional: Horizontal margin in pixels (default: 100) */
  horizontalMargin?: number;
  /** Optional: Use uppercase (default: false - uses Title Case) */
  useUppercase?: boolean;
}

export interface GeneratedCertificate {
  blob: Blob;
  dataUrl: string;
  fileName: string;
}

@Injectable({
  providedIn: 'root',
})
export class CertificateGeneratorService {
  /** Path to the certificate template */
  private readonly TEMPLATE_PATH =
    '/public/Certificado de Reconocimiento Curso de Artes Ilustrado Infantil Multicolor.png';

  /** Cached template image */
  private templateImage: HTMLImageElement | null = null;

  /**
   * Loads the certificate template image
   */
  async loadTemplate(): Promise<HTMLImageElement> {
    if (this.templateImage) {
      return this.templateImage;
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        this.templateImage = img;
        resolve(img);
      };
      img.onerror = (err) => {
        reject(new Error(`Failed to load certificate template: ${err}`));
      };
      img.src = this.TEMPLATE_PATH;
    });
  }

  /**
   * Converts a string to Title Case
   * Example: "JUAN PEREZ" -> "Juan Pérez"
   */
  toTitleCase(str: string): string {
    return str
      .toLowerCase()
      .split(' ')
      .map((word) => {
        if (word.length === 0) return word;
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(' ');
  }

  /**
   * Calculates the optimal font size for the given text to fit within maxWidth
   */
  calculateOptimalFontSize(
    ctx: CanvasRenderingContext2D,
    text: string,
    maxWidth: number,
    maxFontSize: number,
    minFontSize: number,
    fontFamily: string
  ): number {
    let fontSize = maxFontSize;

    while (fontSize > minFontSize) {
      ctx.font = `${fontSize}px ${fontFamily}`;
      const textWidth = ctx.measureText(text).width;

      if (textWidth <= maxWidth) {
        return fontSize;
      }

      fontSize -= 2; // Decrease by 2px each iteration
    }

    return minFontSize;
  }

  /**
   * Generates a single certificate with the name overlaid
   */
  async generateCertificate(config: CertificateGeneratorConfig): Promise<GeneratedCertificate> {
    const {
      fullName,
      yPositionPercent = 54,
      fontColor = '#1D2B53',
      fontFamily = 'Georgia, serif',
      maxFontSize = 90,
      minFontSize = 40,
      horizontalMargin = 100,
      useUppercase = false,
    } = config;

    // Load the template
    const template = await this.loadTemplate();

    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.width = template.width;
    canvas.height = template.height;
    const ctx = canvas.getContext('2d')!;

    // Draw template
    ctx.drawImage(template, 0, 0);

    // Format name
    const formattedName = useUppercase ? fullName.toUpperCase() : this.toTitleCase(fullName);

    // Calculate available width
    const availableWidth = canvas.width - horizontalMargin * 2;

    // Calculate optimal font size
    const optimalFontSize = this.calculateOptimalFontSize(
      ctx,
      formattedName,
      availableWidth,
      maxFontSize,
      minFontSize,
      fontFamily
    );

    // Set text styling
    ctx.font = `${optimalFontSize}px ${fontFamily}`;
    ctx.fillStyle = fontColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Calculate position
    const x = canvas.width / 2;
    const y = (canvas.height * yPositionPercent) / 100;

    // Optional: Add subtle text shadow for better readability
    ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
    ctx.shadowBlur = 2;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;

    // Draw the name
    ctx.fillText(formattedName, x, y);

    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Convert to blob
    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    const blob = await this.dataUrlToBlob(dataUrl);

    // Generate filename (sanitized)
    const sanitizedName = formattedName.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
    const fileName = `Certificado_${sanitizedName}.jpg`;

    return { blob, dataUrl, fileName };
  }

  /**
   * Generates certificates for multiple names
   */
  async generateBatchCertificates(
    names: string[],
    config?: Partial<CertificateGeneratorConfig>,
    onProgress?: (current: number, total: number) => void
  ): Promise<GeneratedCertificate[]> {
    const certificates: GeneratedCertificate[] = [];

    for (let i = 0; i < names.length; i++) {
      const certificate = await this.generateCertificate({
        ...config,
        fullName: names[i],
      });
      certificates.push(certificate);

      if (onProgress) {
        onProgress(i + 1, names.length);
      }
    }

    return certificates;
  }

  /**
   * Converts a data URL to a Blob
   */
  private async dataUrlToBlob(dataUrl: string): Promise<Blob> {
    const response = await fetch(dataUrl);
    return response.blob();
  }

  /**
   * Downloads a single certificate
   */
  downloadCertificate(certificate: GeneratedCertificate): void {
    const link = document.createElement('a');
    link.href = certificate.dataUrl;
    link.download = certificate.fileName;
    link.click();
  }

  /**
   * Creates a preview canvas element of a certificate
   */
  async createPreview(config: CertificateGeneratorConfig, maxWidth: number = 400): Promise<HTMLCanvasElement> {
    const certificate = await this.generateCertificate(config);

    // Create preview canvas
    const img = new Image();
    await new Promise<void>((resolve) => {
      img.onload = () => resolve();
      img.src = certificate.dataUrl;
    });

    const scale = maxWidth / img.width;
    const previewCanvas = document.createElement('canvas');
    previewCanvas.width = maxWidth;
    previewCanvas.height = img.height * scale;

    const ctx = previewCanvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0, previewCanvas.width, previewCanvas.height);

    return previewCanvas;
  }
}
