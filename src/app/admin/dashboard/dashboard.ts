import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { AuthService } from '../../services/auth.service';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

interface Registration {
  id: string;
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
  imports: [CommonModule, FormsModule],
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
  activeTab = signal<'manantial' | 'verbo' | 'crossworlds'>('manantial');

  // Services
  private supabaseService = inject(SupabaseService);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Computed - Filtrar registros por búsqueda
  filteredManantialRegistrations = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const registrations = this.manantialRegistrations();
    
    if (!term) return registrations;
    
    return registrations.filter(r => 
      r.first_name.toLowerCase().includes(term) ||
      r.last_name.toLowerCase().includes(term) ||
      `${r.first_name} ${r.last_name}`.toLowerCase().includes(term)
    );
  });

  filteredVerboRegistrations = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const registrations = this.verboRegistrations();
    
    if (!term) return registrations;
    
    return registrations.filter(r => 
      r.first_name.toLowerCase().includes(term) ||
      r.last_name.toLowerCase().includes(term) ||
      `${r.first_name} ${r.last_name}`.toLowerCase().includes(term)
    );
  });

  filteredCrossworldsRegistrations = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const registrations = this.crossworldsRegistrations();
    
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
      // Cargar todas las listas en paralelo
      const [manantialData, verboData, crossworldsData] = await Promise.all([
        this.supabaseService.getRegistrations(),
        this.supabaseService.getVerboRegistrations(),
        this.supabaseService.getCrossworldsConnectionsRegistrations()
      ]);

      this.manantialRegistrations.set(manantialData || []);
      this.verboRegistrations.set(verboData || []);
      this.crossworldsRegistrations.set(crossworldsData || []);

    } catch (error: any) {
      console.error('Error al cargar registros:', error);
      this.errorMessage.set('Error al cargar los registros. Intenta de nuevo.');
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

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  formatDate(dateString: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-EC', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getGenderLabel(gender: string): string {
    const labels: Record<string, string> = {
      'male': 'Masculino',
      'female': 'Femenino',
      'M': 'Masculino',
      'F': 'Femenino'
    };
    return labels[gender] || gender;
  }

  // Signal para estado de exportación
  isExporting = signal(false);

  /**
   * Exporta todos los registros a un archivo Excel con hojas separadas
   */
  exportToExcel(): void {
    this.isExporting.set(true);

    try {
      // Crear un nuevo workbook
      const workbook = XLSX.utils.book_new();

      // Headers en español para el Excel
      const headers = [
        'ID',
        'Email',
        'Nombre',
        'Apellido',
        'País',
        'Estado/Provincia',
        'Es Corporativo',
        'Género',
        'Edad del Campista',
        'Talla Camiseta',
        'Nombre del Padre/Madre',
        'WhatsApp',
        'Lugar de Recogida',
        'Método de Pago',
        'URL Imagen',
        'Fecha de Registro'
      ];

      // Función para transformar los datos
      const transformData = (registrations: Registration[]) => {
        return registrations.map(reg => ([
          reg.id,
          reg.email,
          reg.first_name,
          reg.last_name,
          reg.country,
          reg.state,
          reg.is_corporate ? 'Sí' : 'No',
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

      // Hoja de Manantial
      const manantialData = [headers, ...transformData(this.manantialRegistrations())];
      const manantialSheet = XLSX.utils.aoa_to_sheet(manantialData);
      this.setColumnWidths(manantialSheet);
      XLSX.utils.book_append_sheet(workbook, manantialSheet, 'Manantial');

      // Hoja de Verbo
      const verboData = [headers, ...transformData(this.verboRegistrations())];
      const verboSheet = XLSX.utils.aoa_to_sheet(verboData);
      this.setColumnWidths(verboSheet);
      XLSX.utils.book_append_sheet(workbook, verboSheet, 'Verbo');

      // Hoja de Crossworlds Connections
      const crossworldsData = [headers, ...transformData(this.crossworldsRegistrations())];
      const crossworldsSheet = XLSX.utils.aoa_to_sheet(crossworldsData);
      this.setColumnWidths(crossworldsSheet);
      XLSX.utils.book_append_sheet(workbook, crossworldsSheet, 'Crossworlds Connections');

      // Generar el archivo Excel
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      // Nombre del archivo con fecha actual
      const today = new Date();
      const fileName = `CrossWorlds_Registros_${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}.xlsx`;
      
      saveAs(blob, fileName);

    } catch (error) {
      console.error('Error al exportar a Excel:', error);
      this.errorMessage.set('Error al exportar los registros. Intenta de nuevo.');
    } finally {
      this.isExporting.set(false);
    }
  }

  /**
   * Establece el ancho de las columnas para mejor visualización
   */
  private setColumnWidths(sheet: XLSX.WorkSheet): void {
    sheet['!cols'] = [
      { wch: 10 },  // ID
      { wch: 30 },  // Email
      { wch: 15 },  // Nombre
      { wch: 15 },  // Apellido
      { wch: 10 },  // País
      { wch: 20 },  // Estado
      { wch: 12 },  // Es Corporativo
      { wch: 12 },  // Género
      { wch: 15 },  // Edad
      { wch: 12 },  // Talla
      { wch: 25 },  // Padre/Madre
      { wch: 18 },  // WhatsApp
      { wch: 25 },  // Lugar Recogida
      { wch: 15 },  // Método Pago
      { wch: 50 },  // URL Imagen
      { wch: 20 },  // Fecha
    ];
  }
}
