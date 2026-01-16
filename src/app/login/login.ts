import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  loginForm!: FormGroup;
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  showPassword = signal(false);

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword.update(v => !v);
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const { username, password } = this.loginForm.value;
      
      // Simulación de delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Usar AuthService para validar credenciales
      if (this.authService.login(username, password)) {
        this.errorMessage.set('Login exitoso');
        // Redirigir al admin después de 1 segundo
        setTimeout(() => {
          this.router.navigate(['/admin']);
        }, 1000);
      } else {
        throw new Error('Usuario o contraseña incorrectos');
      }
      
    } catch (error: any) {
      console.error('Error en login:', error);
      this.errorMessage.set(error.message || 'Error al iniciar sesión');
    } finally {
      this.isLoading.set(false);
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field?.errors && field?.touched);
  }

  getFieldError(fieldName: string): string | null {
    const field = this.loginForm.get(fieldName);
    if (!field?.errors || !field?.touched) return null;

    if (field.errors['required']) return 'Este campo es obligatorio';
    if (field.errors['minlength']) return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;
    
    return 'Campo inválido';
  }
}
