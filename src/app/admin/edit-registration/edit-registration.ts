
import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';

@Component({
    selector: 'app-edit-registration',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './edit-registration.html',
})
export class EditRegistrationComponent implements OnInit {
    // Services
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private supabaseService = inject(SupabaseService);

    // State
    isLoading = signal(true);
    isSaving = signal(false);
    errorMessage = signal<string | null>(null);
    successMessage = signal<string | null>(null);

    // Route params
    registrationType = signal<'manantial' | 'verbo' | 'crossworlds' | null>(null);
    registrationId = signal<string | null>(null);

    // Form Data
    formData: any = {};
    selectedFile: File | null = null;
    imagePreview: string | null = null;

    // Options lists
    paymentOptions = signal<string[]>([
        'Pagare en efectivo / en persona a Crossworlds Center for Connections',
        'Pagaré por transferencia (recibiré instrucciones)',
        'Solicito beca / no realizaré pago (Sólo disponible si lo aprueba una iglesia participante.)'
    ]);

    pickupOptions = signal<string[]>([
        'Iglesia Verbo (Av 24 entre calle 17 y calle 20)',
        'Iglesia Manantial de Vida (Barrio San Pedro, calle 310 entre av. 204 y 205)',
        'No hay transporte en bus (Esta opción debe ser aprobada previamente por CrossWorlds)'
    ]);

    ngOnInit() {
        this.route.params.subscribe(params => {
            console.log('Route params:', params); // DEBUG
            const type = params['type'] as 'manantial' | 'verbo' | 'crossworlds';
            const id = params['id'];
            console.log('Parsed - Type:', type, 'ID:', id); // DEBUG

            if (type && id) {
                this.registrationType.set(type);
                this.registrationId.set(id);
                this.loadRegistration(type, id);
            } else {
                console.error('Invalid parameters'); // DEBUG
                this.errorMessage.set('Invalid registration parameters.');
                this.isLoading.set(false);
            }
        });
    }

    async loadRegistration(type: 'manantial' | 'verbo' | 'crossworlds', id: string) {
        console.log('Loading registration...', type, id); // DEBUG
        this.isLoading.set(true);
        this.errorMessage.set(null);

        try {
            let data;
            switch (type) {
                case 'manantial':
                    data = await this.supabaseService.getRegistrationById(id);
                    break;
                case 'verbo':
                    data = await this.supabaseService.getVerboRegistrationById(id);
                    break;
                case 'crossworlds':
                    data = await this.supabaseService.getCrossworldsConnectionsRegistrationById(id);
                    break;
            }
            console.log('Fetched Data:', data); // DEBUG

            if (data) {
                this.formData = { ...data };
                this.imagePreview = this.formData.imagen_url;

                // Handle Dynamic Options for Payment Method
                if (this.formData.payment_method && !this.paymentOptions().includes(this.formData.payment_method)) {
                    this.paymentOptions.update(opts => [...opts, this.formData.payment_method]);
                }

                // Handle Dynamic Options for Pickup Location
                if (this.formData.bus_place && !this.pickupOptions().includes(this.formData.bus_place)) {
                    this.pickupOptions.update(opts => [...opts, this.formData.bus_place]);
                }

            } else {
                this.errorMessage.set('Registration not found.');
            }

        } catch (error: any) {
            console.error('Error loading registration:', error);
            this.errorMessage.set('Error loading registration details.');
        } finally {
            this.isLoading.set(false);
        }
    }

    onFileSelected(event: any) {
        const file = event.target.files[0];
        if (file) {
            this.selectedFile = file;
            // Creator preview URL
            const reader = new FileReader();
            reader.onload = (e) => {
                this.imagePreview = e.target?.result as string;
            };
            reader.readAsDataURL(file);
        }
    }

    async onSave() {
        const type = this.registrationType();
        const id = this.registrationId();

        if (!type || !id) return;

        this.isSaving.set(true);
        this.errorMessage.set(null);
        this.successMessage.set(null);

        try {
            console.log('Starting save process...');

            // 1. Upload new image if selected
            if (this.selectedFile) {
                console.log('Uploading file...');
                const camperName = `${this.formData.first_name} ${this.formData.last_name}`;
                let newImageUrl = '';

                switch (type) {
                    case 'manantial':
                        newImageUrl = await this.supabaseService.uploadCamperImage(this.selectedFile, camperName);
                        break;
                    case 'verbo':
                        newImageUrl = await this.supabaseService.uploadVerboCamperImage(this.selectedFile, camperName);
                        break;
                    case 'crossworlds':
                        newImageUrl = await this.supabaseService.uploadCrossworldsConnectionsImage(this.selectedFile, camperName);
                        break;
                }

                if (newImageUrl) {
                    this.formData.imagen_url = newImageUrl;
                }
            }

            // Remove read-only or system fields if necessary, though Supabase usually ignores extra fields if not in schema, 
            // but it's better to send only updatable fields. For simplicity we send everything and let Supabase handle it 
            // (or cleaner: destructure id, created_at out).
            const { id: _id, created_at, ...updateData } = this.formData;

            console.log('Updating with data:', updateData); // DEBUG log

            let result;
            switch (type) {
                case 'manantial':
                    result = await this.supabaseService.updateRegistration(id, updateData);
                    break;
                case 'verbo':
                    result = await this.supabaseService.updateVerboRegistration(id, updateData);
                    break;
                case 'crossworlds':
                    result = await this.supabaseService.updateCrossworldsConnectionsRegistration(id, updateData);
                    break;
            }

            console.log('Update result:', result);

            this.successMessage.set('Registration updated successfully!');
            // Optional: Redirect after short delay or let user choose
            setTimeout(() => {
                this.goBack();
            }, 1500);

        } catch (error: any) {
            console.error('Error updating registration:', error);
            // Show detailed error if available
            const errorMsg = error.message || error.error_description || JSON.stringify(error);
            this.errorMessage.set(`Failed to update registration: ${errorMsg}`);
        } finally {
            this.isSaving.set(false);
        }
    }

    goBack() {
        this.router.navigate(['/admin']);
    }
}
