import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pincipal-page',
  imports: [],
  templateUrl: './Pincipal-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PincipalPage {
  private router = inject(Router);

  navigateToManantial(): void {
    this.router.navigate(['/manantial-form']);
  }

  navigateToVerbo(): void {
    this.router.navigate(['/verbo-form']);
  }

  navigateToAdmin(): void {
    this.router.navigate(['/login']);
  }

  navigateToCrossworlds(): void {
    this.router.navigate(['/crossworlds-form']);
  }
}
