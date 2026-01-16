import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticated = signal(false);

  login(username: string, password: string): boolean {
    // Credenciales hardcodeadas
    if (username === 'steve1234' && password === '123456') {
      this.isAuthenticated.set(true);
      sessionStorage.setItem('isLoggedIn', 'true');
      return true;
    }
    return false;
  }

  logout(): void {
    this.isAuthenticated.set(false);
    sessionStorage.removeItem('isLoggedIn');
  }

  isLoggedIn(): boolean {
    // Verificar en sessionStorage para persistir entre recargas
    const stored = sessionStorage.getItem('isLoggedIn');
    if (stored === 'true') {
      this.isAuthenticated.set(true);
    }
    return this.isAuthenticated();
  }
}
