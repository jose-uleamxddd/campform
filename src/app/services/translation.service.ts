import { Injectable, signal } from '@angular/core';

export type Language = 'en' | 'es';

export interface Translations {
  // Up-bar
  back: string;
  language: string;
  
  // Form sections
  yourInformation: string;
  yourInformationDesc: string;
  camperDetails: string;
  camperDetailsDesc: string;
  registrationSummary: string;
  registrationSummaryDesc: string;
  
  // Form fields
  emailAddress: string;
  firstName: string;
  lastName: string;
  country: string;
  state: string;
  corporatePurchase: string;
  camperGender: string;
  ageOfCamper: string;
  tshirtSize: string;
  parentName: string;
  whatsappNumber: string;
  busPickupLocation: string;
  paymentMethod: string;
  camperPhoto: string;
  
  // Placeholders
  emailPlaceholder: string;
  firstNamePlaceholder: string;
  lastNamePlaceholder: string;
  parentNamePlaceholder: string;
  whatsappPlaceholder: string;
  photoPlaceholder: string;
  
  // Options
  choose: string;
  male: string;
  female: string;
  years: string;
  
  // Bus options
  busOptionCrossworlds: string;
  busOptionVerbo: string;
  busOptionManantial: string;
  busOptionNone: string;
  
  // Payment options
  paymentCash: string;
  paymentTransfer: string;
  paymentScholarship: string;
  
  // Buttons & Messages
  uploadPhoto: string;
  completeRegistration: string;
  sending: string;
  registrationSuccess: string;
  pleaseUploadPhoto: string;
  maxFileSize: string;
  termsConditions: string;
  
  // Required field
  required: string;
}

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  currentLanguage = signal<Language>('en');
  
  private translations: Record<Language, Translations> = {
    en: {
      // Up-bar
      back: 'Back',
      language: 'Language:',
      
      // Form sections
      yourInformation: 'Your Information',
      yourInformationDesc: 'Please provide your contact details',
      camperDetails: 'Camper Details',
      camperDetailsDesc: 'Tell us about the camper',
      registrationSummary: 'Registration Summary',
      registrationSummaryDesc: 'Review your registration',
      
      // Form fields
      emailAddress: 'Email Address',
      firstName: 'First Name',
      lastName: 'Last Name',
      country: 'Country',
      state: 'State',
      corporatePurchase: 'This is a corporate/organization purchase',
      camperGender: 'Camper Gender',
      ageOfCamper: 'Age of Camper',
      tshirtSize: 'T-shirt Size',
      parentName: 'Parent First & Last Name',
      whatsappNumber: 'WhatsApp Number',
      busPickupLocation: 'Bus Pick-up Location',
      paymentMethod: 'Payment Method',
      camperPhoto: 'Camper Photo',
      
      // Placeholders
      emailPlaceholder: 'example@email.com',
      firstNamePlaceholder: 'John',
      lastNamePlaceholder: 'Doe',
      parentNamePlaceholder: 'Parent\'s full name',
      whatsappPlaceholder: '09693406969',
      photoPlaceholder: 'Click to upload photo',
      
      // Options
      choose: 'Choose...',
      male: 'Male',
      female: 'Female',
      years: 'years',
      
      // Bus options
      busOptionCrossworlds: 'CrossWorlds Center for Connections',
      busOptionVerbo: 'Iglesia Verbo (Av 24 entre calle 17 y calle 20)',
      busOptionManantial: 'Iglesia Manantial de Vida (Barrio San Pedro, calle 310 entre av. 204 y 205)',
      busOptionNone: 'No bus transportation (This option must be previously approved by CrossWorlds)',
      
      // Payment options
      paymentCash: 'I will pay in cash / in person at Crossworlds Center for Connections',
      paymentTransfer: 'I will pay by transfer (I will receive instructions)',
      paymentScholarship: 'I request a scholarship / I will not make payment (Only available if approved by a participating church.)',
      
      // Buttons & Messages
      uploadPhoto: 'Click to upload photo',
      completeRegistration: 'Complete Registration',
      sending: 'Sending...',
      registrationSuccess: 'Registration successful! Redirecting...',
      pleaseUploadPhoto: 'Please upload a photo of the camper',
      maxFileSize: 'Maximum file size: 5MB. Supported formats: JPG, PNG, GIF',
      termsConditions: 'By submitting, you agree to our Terms & Conditions',
      
      // Required field
      required: '*',
    },
    es: {
      // Up-bar
      back: 'Atrás',
      language: 'Idioma:',
      
      // Form sections
      yourInformation: 'Tu Información',
      yourInformationDesc: 'Por favor proporciona tus datos de contacto',
      camperDetails: 'Detalles del Campista',
      camperDetailsDesc: 'Cuéntanos sobre el campista',
      registrationSummary: 'Resumen de Inscripción',
      registrationSummaryDesc: 'Revisa tu inscripción',
      
      // Form fields
      emailAddress: 'Correo Electrónico',
      firstName: 'Nombre',
      lastName: 'Apellido',
      country: 'País',
      state: 'Estado/Provincia',
      corporatePurchase: 'Esta es una compra corporativa/organizacional',
      camperGender: 'Género del Campista',
      ageOfCamper: 'Edad del Campista',
      tshirtSize: 'Talla de Camiseta',
      parentName: 'Nombre y Apellido del Padre/Madre',
      whatsappNumber: 'Número de WhatsApp',
      busPickupLocation: 'Lugar de Recogida del Bus',
      paymentMethod: 'Método de Pago',
      camperPhoto: 'Foto del Campista',
      
      // Placeholders
      emailPlaceholder: 'ejemplo@correo.com',
      firstNamePlaceholder: 'Juan',
      lastNamePlaceholder: 'Pérez',
      parentNamePlaceholder: 'Nombre completo del padre/madre',
      whatsappPlaceholder: '09693406969',
      photoPlaceholder: 'Haz clic para subir foto',
      
      // Options
      choose: 'Seleccionar...',
      male: 'Masculino',
      female: 'Femenino',
      years: 'años',
      
      // Bus options
      busOptionCrossworlds: 'CrossWorlds Center for Connections',
      busOptionVerbo: 'Iglesia Verbo (Av 24 entre calle 17 y calle 20)',
      busOptionManantial: 'Iglesia Manantial de Vida (Barrio San Pedro, calle 310 entre av. 204 y 205)',
      busOptionNone: 'No hay transporte en bus (Esta opción debe ser aprobada previamente por CrossWorlds)',
      
      // Payment options
      paymentCash: 'Pagaré en efectivo / en persona a Crossworlds Center for Connections',
      paymentTransfer: 'Pagaré por transferencia (recibiré instrucciones)',
      paymentScholarship: 'Solicito beca / no realizaré pago (Sólo disponible si lo aprueba una iglesia participante.)',
      
      // Buttons & Messages
      uploadPhoto: 'Haz clic para subir foto',
      completeRegistration: 'Completar Inscripción',
      sending: 'Enviando...',
      registrationSuccess: '¡Registro exitoso! Redirigiendo...',
      pleaseUploadPhoto: 'Por favor sube una foto del campista',
      maxFileSize: 'Tamaño máximo de archivo: 5MB. Formatos soportados: JPG, PNG, GIF',
      termsConditions: 'Al enviar, aceptas nuestros Términos y Condiciones',
      
      // Required field
      required: '*',
    }
  };
  
  t = signal<Translations>(this.translations['en']);
  
  constructor() {
    // Load saved language preference
    const savedLang = localStorage.getItem('language') as Language;
    if (savedLang && (savedLang === 'en' || savedLang === 'es')) {
      this.setLanguage(savedLang);
    }
  }
  
  setLanguage(lang: Language): void {
    this.currentLanguage.set(lang);
    this.t.set(this.translations[lang]);
    localStorage.setItem('language', lang);
  }
  
  toggleLanguage(): void {
    const newLang = this.currentLanguage() === 'en' ? 'es' : 'en';
    this.setLanguage(newLang);
  }
  
  getTranslations(): Translations {
    return this.t();
  }
}
