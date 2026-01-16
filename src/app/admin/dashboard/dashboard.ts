import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { AuthService } from '../../services/auth.service';

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
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);
  searchTerm = signal('');
  activeTab = signal<'manantial' | 'verbo'>('manantial');

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

  // Computed - Contadores
  manantialCount = computed(() => this.manantialRegistrations().length);
  verboCount = computed(() => this.verboRegistrations().length);
  totalCount = computed(() => this.manantialCount() + this.verboCount());

  ngOnInit(): void {
    this.loadAllRegistrations();
  }

  async loadAllRegistrations(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      // Cargar ambas listas en paralelo
      const [manantialData, verboData] = await Promise.all([
        this.supabaseService.getRegistrations(),
        this.supabaseService.getVerboRegistrations()
      ]);

      this.manantialRegistrations.set(manantialData || []);
      this.verboRegistrations.set(verboData || []);

    } catch (error: any) {
      console.error('Error al cargar registros:', error);
      this.errorMessage.set('Error al cargar los registros. Intenta de nuevo.');
    } finally {
      this.isLoading.set(false);
    }
  }

  setActiveTab(tab: 'manantial' | 'verbo'): void {
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
}
