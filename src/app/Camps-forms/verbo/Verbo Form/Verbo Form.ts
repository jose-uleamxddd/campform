import { ChangeDetectionStrategy, Component, effect, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../../services/supabase.service';
import { Country, State } from '../../../interfaces/country.interface';
import { CountrySelectBar } from '../../../services/CountrySelectBar.service';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import { filter } from 'rxjs/internal/operators/filter';
import { tap } from 'rxjs/internal/operators/tap';
import { FormUtils } from '../../../utils/form-utils';
import { UpBar } from "../../../components/shared/up-bar/up-bar";
import { TextRotate } from "../../../components/shared/text-rotate/text-rotate";

@Component({
  selector: 'app-verbo-form',
  imports: [CommonModule, ReactiveFormsModule, UpBar, TextRotate],
  templateUrl: './Verbo Form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VerboForm {
  formData!: FormGroup;
  selectedImage = signal<File | null>(null);
  imagePreview = signal<string | null>(null);
  isSubmitting = signal(false);
  submitSuccess = signal(false);
  submitError = signal<string | null>(null);
  countries = signal<Country[]>([]);
  provincias = signal<State[]>([]);
  textRotateWords = signal<string[]>(['IGLESIA', 'VERBO']);



  fb= inject(FormBuilder);
  supabaseService = inject(SupabaseService);
  countrySelectBar = inject(CountrySelectBar);
  formUtils = FormUtils;
  

  ngOnInit(): void {
    this.formData = this.fb.group({
      email: ['', [Validators.required, Validators.email ,Validators.pattern(FormUtils.emailPattern)]],
      firstName: ['', [Validators.required, Validators.pattern(FormUtils.namePattern)]],
      lastName: ['', [Validators.required, Validators.pattern(FormUtils.namePattern)]],
      country: ['EC', Validators.required],
      state: ['', Validators.required],
      isCorporate: [false],
      camperGender: ['', Validators.required],
      ageOfCamper: ['', Validators.required],
      tshirtSize: ['', Validators.required],
      parentName: ['', Validators.required],
      whatsappNumber: ['', Validators.required],
      busPlace: ['', Validators.required],
      paymentMethod: ['', Validators.required],
      camperImage: [null, Validators.required] // Campo para la imagen
    });
    this.getCountry();
    this.loadInitialStates();
  }

  loadInitialStates(): void {
    const initialCountryCode = this.formData.get('country')?.value;
    if (initialCountryCode && initialCountryCode.length > 0) {
      this.countrySelectBar.getStatesByCountry(initialCountryCode).subscribe({
        next: (provincias) => {
          this.provincias.set(provincias);
          console.log('Estados iniciales cargados:', provincias);
        },
        error: (error) => {
          console.error('Error al cargar estados:', error);
        }
      });
    }
  }

  onFormChanged= effect((onCleanup) => {
    const countrySubscription = this.onCountryChanged();
    onCleanup(() =>{
     countrySubscription.unsubscribe();
    });
  });

  onCountryChanged() {
    return this.formData.get('country')!.valueChanges
    .pipe(
      tap(() => this.formData.get('state')!.setValue('')),
      filter( value =>value!.length >0),  
      switchMap(alphaCode => this.countrySelectBar.getStatesByCountry(alphaCode ?? ''),
      ) 
    )
    .subscribe( (provincias) => {
       console.log({ provincias });
       this.provincias.set(provincias);

    });
  }


  getCountry(): void {
    this.countrySelectBar.getCountries().subscribe({
      next: (countries) => {
        this.countries.set(countries);
        console.log('Países cargados:', countries);
      },
      error: (error) => {
        console.error('Error al cargar países:', error);
      }
    });
  }

  
  /**
   * Maneja la selección de imagen
   */
  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Validar que sea una imagen
      if (!file.type.startsWith('image/')) {
        this.submitError.set('Por favor selecciona un archivo de imagen válido');
        return;
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.submitError.set('La imagen no debe superar los 5MB');
        return;
      }

      this.selectedImage.set(file);
      this.formData.patchValue({ camperImage: file });

      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview.set(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      this.submitError.set(null);
    }
  }

  /**
   * Elimina la imagen seleccionada
   */
  removeImage(): void {
    this.selectedImage.set(null);
    this.imagePreview.set(null);
    this.formData.patchValue({ camperImage: null });
  }

  async onSubmit(): Promise<void> {
    if (this.formData.invalid) {
      console.log('Form is invalid');
      this.formData.markAllAsTouched();
      this.submitError.set('Por favor completa todos los campos requeridos');
      return;
    }

    this.isSubmitting.set(true);
    this.submitError.set(null);
    this.submitSuccess.set(false);

    try {
      const formValues = this.formData.value;
      let imageUrl = '';

      // 1. Subir la imagen si existe (carpeta verbo)
      if (this.selectedImage()) {
        const camperFullName = `${formValues.firstName}_${formValues.lastName}`;
        imageUrl = await this.supabaseService.uploadVerboCamperImage(
          this.selectedImage()!,
          camperFullName
        );
        console.log('Imagen Verbo subida exitosamente:', imageUrl);
      }

      // 2. Preparar datos para Supabase (convertir camelCase a snake_case)
      const registrationData = {
        email: formValues.email,
        first_name: formValues.firstName,
        last_name: formValues.lastName,
        country: formValues.country,
        state: formValues.state,
        is_corporate: formValues.isCorporate,
        camper_gender: formValues.camperGender,
        age_of_camper: formValues.ageOfCamper,
        tshirt_size: formValues.tshirtSize,
        parent_name: formValues.parentName,
        whatsapp_number: formValues.whatsappNumber,
        bus_place: formValues.busPlace,
        payment_method: formValues.paymentMethod,
        imagen_url: imageUrl
      };

      // 3. Guardar en Supabase (tabla verbo_registrations)
      const result = await this.supabaseService.createVerboRegistration(registrationData);
      console.log('Registro Verbo creado exitosamente:', result);

      this.submitSuccess.set(true);
      
      // Resetear formulario después de 2 segundos
      setTimeout(() => {
        this.formData.reset({
          country: 'EC',
          state: '',
          isCorporate: false
        });
        this.removeImage();
        this.submitSuccess.set(false);
        this.loadInitialStates();
      }, 2000);

    } catch (error: any) {
      console.error('Error al enviar formulario:', error);
      this.submitError.set(
        error.message || 'Ocurrió un error al enviar el formulario. Por favor intenta de nuevo.'
      );
    } finally {
      this.isSubmitting.set(false);
    }
  }
 }
