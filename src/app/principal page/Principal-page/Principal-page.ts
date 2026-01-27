import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-principal-page',
  imports: [],
  templateUrl: './Principal-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrincipalPage {
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
