
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { AuthService } from '../../services/auth.service';
import { CertificateComponent, CertificateData } from '../certificate/certificate';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';

interface Registration {
  id: string; // Changed to string to match Supabase UUIDs
  email: string;
  first_name: string;
  last_name: string;
  country: string;
  state: string;
  is_corporate: boolean;
  camper_gender: string;
  age_of_camper: string;
  tshirt_size: string;
  parent_name: string;
  whatsapp_number: string;
  bus_place: string;
  payment_method: string;
  imagen_url: string;
  created_at: string;
  pickup_location: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, CertificateComponent],
  templateUrl: './dashboard.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  // Signals
  manantialRegistrations = signal<Registration[]>([]);
  verboRegistrations = signal<Registration[]>([]);
  crossworldsRegistrations = signal<Registration[]>([]);
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);
  searchTerm = signal('');
  tshirtSizeFilter = signal<string>('');
  activeTab = signal<'manantial' | 'verbo' | 'crossworlds'>('manantial');

  // Computed - Available t-shirt sizes across all registrations
  availableTshirtSizes = computed(() => {
    const allRegs = [
      ...this.manantialRegistrations(),
      ...this.verboRegistrations(),
      ...this.crossworldsRegistrations()
    ];
    const sizes = new Set(allRegs.map(r => r.tshirt_size).filter(Boolean));
    const sizeOrder = ['YXS', 'YS', 'YM', 'YL', 'YXL', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
    return [...sizes].sort((a, b) => {
      const iA = sizeOrder.indexOf(a.toUpperCase());
      const iB = sizeOrder.indexOf(b.toUpperCase());
      return (iA === -1 ? 99 : iA) - (iB === -1 ? 99 : iB);
    });
  });

  // Services
  private supabaseService = inject(SupabaseService);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Computed - Filtrar registros por búsqueda
  filteredManantialRegistrations = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const sizeFilter = this.tshirtSizeFilter();
    let registrations = this.manantialRegistrations();

    if (sizeFilter) {
      registrations = registrations.filter(r => r.tshirt_size === sizeFilter);
    }

    if (!term) return registrations;

    return registrations.filter(r =>
      r.first_name.toLowerCase().includes(term) ||
      r.last_name.toLowerCase().includes(term) ||
      `${r.first_name} ${r.last_name}`.toLowerCase().includes(term)
    );
  });

  filteredVerboRegistrations = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const sizeFilter = this.tshirtSizeFilter();
    let registrations = this.verboRegistrations();

    if (sizeFilter) {
      registrations = registrations.filter(r => r.tshirt_size === sizeFilter);
    }

    if (!term) return registrations;

    return registrations.filter(r =>
      r.first_name.toLowerCase().includes(term) ||
      r.last_name.toLowerCase().includes(term) ||
      `${r.first_name} ${r.last_name}`.toLowerCase().includes(term)
    );
  });

  filteredCrossworldsRegistrations = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const sizeFilter = this.tshirtSizeFilter();
    let registrations = this.crossworldsRegistrations();

    if (sizeFilter) {
      registrations = registrations.filter(r => r.tshirt_size === sizeFilter);
    }

    if (!term) return registrations;

    return registrations.filter(r =>
      r.first_name.toLowerCase().includes(term) ||
      r.last_name.toLowerCase().includes(term) ||
      `${r.first_name} ${r.last_name}`.toLowerCase().includes(term)
    );
  });

  // Computed - Contadores
  manantialCount = computed(() => this.manantialRegistrations().length);
  verboCount = computed(() => this.verboRegistrations().length);
  crossworldsCount = computed(() => this.crossworldsRegistrations().length);
  totalCount = computed(() => this.manantialCount() + this.verboCount() + this.crossworldsCount());

  ngOnInit(): void {
    this.loadAllRegistrations();
  }

  async loadAllRegistrations(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      // Load all lists in parallel
      const [manantialData, verboData, crossworldsData] = await Promise.all([
        this.supabaseService.getRegistrations(),
        this.supabaseService.getVerboRegistrations(),
        this.supabaseService.getCrossworldsConnectionsRegistrations()
      ]);

      this.manantialRegistrations.set(manantialData || []);
      this.verboRegistrations.set(verboData || []);
      this.crossworldsRegistrations.set(crossworldsData || []);

    } catch (error: any) {
      console.error('Error loading registrations:', error);
      this.errorMessage.set('Error loading registrations. Please try again.');
    } finally {
      this.isLoading.set(false);
    }
  }

  setActiveTab(tab: 'manantial' | 'verbo' | 'crossworlds'): void {
    this.activeTab.set(tab);
  }

  onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }

  clearSearch(): void {
    this.searchTerm.set('');
  }

  onTshirtSizeFilterChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.tshirtSizeFilter.set(select.value);
  }

  clearTshirtSizeFilter(): void {
    this.tshirtSizeFilter.set('');
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  formatDate(dateString: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getGenderLabel(gender: string): string {
    const labels: Record<string, string> = {
      'male': 'Male',
      'female': 'Female',
      'M': 'Male',
      'F': 'Female'
    };
    return labels[gender] || gender;
  }

  async deleteRegistration(id: string, type: 'manantial' | 'verbo' | 'crossworlds') {
    if (!confirm('Are you sure you want to delete this registration? This action cannot be undone.')) {
      return;
    }

    this.isLoading.set(true);
    try {
      switch (type) {
        case 'manantial':
          await this.supabaseService.deleteRegistration(id);
          this.manantialRegistrations.update(regs => regs.filter(r => r.id !== id));
          break;
        case 'verbo':
          await this.supabaseService.deleteVerboRegistration(id);
          this.verboRegistrations.update(regs => regs.filter(r => r.id !== id));
          break;
        case 'crossworlds':
          await this.supabaseService.deleteCrossworldsConnectionsRegistration(id);
          this.crossworldsRegistrations.update(regs => regs.filter(r => r.id !== id));
          break;
      }
    } catch (error) {
      console.error('Error deleting registration:', error);
      alert('Failed to delete registration. Please try again.');
    } finally {
      this.isLoading.set(false);
    }
  }

  // Signal for export state
  isExporting = signal(false);
  isDownloadingPhotos = signal(false);
  downloadingPhotosTab = signal<string | null>(null);
  showCertificates = signal(false);
  certificateCampType = signal<'manantial' | 'verbo' | 'crossworlds'>('manantial');

  /**
   * Gets certificate data for the selected camp type
   */
  certificateData = computed((): CertificateData[] => {
    const type = this.certificateCampType();
    let registrations: Registration[] = [];

    switch (type) {
      case 'manantial':
        registrations = this.manantialRegistrations();
        break;
      case 'verbo':
        registrations = this.verboRegistrations();
        break;
      case 'crossworlds':
        registrations = this.crossworldsRegistrations();
        break;
    }

    return registrations.map(r => ({
      first_name: r.first_name,
      last_name: r.last_name,
      age_of_camper: r.age_of_camper,
      country: r.country,
      state: r.state,
      camp_type: type,
    }));
  });

  /**
   * Downloads all photos for a given camp as a ZIP file
   */
  async downloadPhotosZip(type: 'manantial' | 'verbo' | 'crossworlds'): Promise<void> {
    this.isDownloadingPhotos.set(true);
    this.downloadingPhotosTab.set(type);

    try {
      let registrations: Registration[] = [];
      switch (type) {
        case 'manantial':
          registrations = this.manantialRegistrations();
          break;
        case 'verbo':
          registrations = this.verboRegistrations();
          break;
        case 'crossworlds':
          registrations = this.crossworldsRegistrations();
          break;
      }

      // Filter only registrations with photos
      const withPhotos = registrations.filter(r => r.imagen_url);

      if (withPhotos.length === 0) {
        alert('No photos found for this camp.');
        return;
      }

      const zip = new JSZip();
      const folder = zip.folder(`${type}_photos`)!;
      let downloaded = 0;

      for (const reg of withPhotos) {
        try {
          const response = await fetch(reg.imagen_url);
          if (!response.ok) continue;

          const blob = await response.blob();
          const ext = this.getFileExtension(reg.imagen_url, blob.type);
          const fileName = `${reg.first_name}_${reg.last_name}`.replace(/[^a-zA-Z0-9_-]/g, '_');
          folder.file(`${fileName}.${ext}`, blob);
          downloaded++;
        } catch (err) {
          console.warn(`Could not download photo for ${reg.first_name} ${reg.last_name}:`, err);
        }
      }

      if (downloaded === 0) {
        alert('Could not download any photos. Please check the image URLs.');
        return;
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const today = new Date();
      const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      saveAs(content, `${type}_photos_${dateStr}.zip`);

    } catch (error) {
      console.error('Error downloading photos:', error);
      this.errorMessage.set('Error downloading photos. Please try again.');
    } finally {
      this.isDownloadingPhotos.set(false);
      this.downloadingPhotosTab.set(null);
    }
  }

  /**
   * Gets file extension from URL or MIME type
   */
  private getFileExtension(url: string, mimeType: string): string {
    // Try to get extension from URL
    const urlExt = url.split('?')[0].split('.').pop()?.toLowerCase();
    if (urlExt && ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(urlExt)) {
      return urlExt;
    }
    // Fallback to MIME type
    const mimeMap: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/webp': 'webp',
      'image/bmp': 'bmp',
      'image/svg+xml': 'svg',
    };
    return mimeMap[mimeType] || 'jpg';
  }

  /**
   * Opens certificate print view for a camp type
   */
  openCertificates(type: 'manantial' | 'verbo' | 'crossworlds'): void {
    this.certificateCampType.set(type);
    this.showCertificates.set(true);
  }

  /**
   * Closes certificate view
   */
  closeCertificates(): void {
    this.showCertificates.set(false);
  }

  /**
   * Prints all certificates
   */
  printCertificates(): void {
    window.print();
  }

  /**
   * Exports all registrations to an Excel file with separate sheets
   */
  exportToExcel(): void {
    this.isExporting.set(true);

    try {
      // Create a new workbook
      const workbook = XLSX.utils.book_new();

      // Headers in English for Excel
      const headers = [
        'ID',
        'Email',
        'First Name',
        'Last Name',
        'Country',
        'State/Province',
        'Is Corporate',
        'Gender',
        'Camper Age',
        'T-Shirt Size',
        'Parent/Guardian Name',
        'WhatsApp',
        'Pickup Location',
        'Payment Method',
        'Image URL',
        'Registration Date'
      ];

      // Function to transform data
      const transformData = (registrations: Registration[]) => {
        return registrations.map(reg => ([
          reg.id,
          reg.email,
          reg.first_name,
          reg.last_name,
          reg.country,
          reg.state,
          reg.is_corporate ? 'Yes' : 'No',
          this.getGenderLabel(reg.camper_gender),
          reg.age_of_camper,
          reg.tshirt_size,
          reg.parent_name,
          reg.whatsapp_number,
          reg.bus_place,
          reg.payment_method,
          reg.imagen_url,
          this.formatDate(reg.created_at)
        ]));
      };

      // Fountain of Life sheet
      const manantialData = [headers, ...transformData(this.manantialRegistrations())];
      const manantialSheet = XLSX.utils.aoa_to_sheet(manantialData);
      this.setColumnWidths(manantialSheet);
      XLSX.utils.book_append_sheet(workbook, manantialSheet, 'Fountain of Life');

      // Word sheet
      const verboData = [headers, ...transformData(this.verboRegistrations())];
      const verboSheet = XLSX.utils.aoa_to_sheet(verboData);
      this.setColumnWidths(verboSheet);
      XLSX.utils.book_append_sheet(workbook, verboSheet, 'Word');

      // Crossworlds Connections sheet
      const crossworldsData = [headers, ...transformData(this.crossworldsRegistrations())];
      const crossworldsSheet = XLSX.utils.aoa_to_sheet(crossworldsData);
      this.setColumnWidths(crossworldsSheet);
      XLSX.utils.book_append_sheet(workbook, crossworldsSheet, 'Crossworlds Connections');

      // Generate Excel file
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

      // File name with current date
      const today = new Date();
      const fileName = `CrossWorlds_Registrations_${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}.xlsx`;

      saveAs(blob, fileName);

    } catch (error) {
      console.error('Error exporting to Excel:', error);
      this.errorMessage.set('Error exporting registrations. Please try again.');
    } finally {
      this.isExporting.set(false);
    }
  }

  /**
   * Sets column widths for better visualization
   */
  private setColumnWidths(sheet: XLSX.WorkSheet): void {
    sheet['!cols'] = [
      { wch: 10 },  // ID
      { wch: 30 },  // Email
      { wch: 15 },  // First Name
      { wch: 15 },  // Last Name
      { wch: 10 },  // Country
      { wch: 20 },  // State
      { wch: 12 },  // Is Corporate
      { wch: 12 },  // Gender
      { wch: 15 },  // Age
      { wch: 12 },  // Size
      { wch: 25 },  // Parent/Guardian
      { wch: 18 },  // WhatsApp
      { wch: 25 },  // Pickup Location
      { wch: 15 },  // Payment Method
      { wch: 50 },  // Image URL
      { wch: 20 },  // Date
    ];
  }
}
