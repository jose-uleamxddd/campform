import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslationService } from '../../../services/translation.service';

@Component({
  selector: 'app-up-bar',
  imports: [RouterLink],
  templateUrl: './up-bar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UpBar { 
  translationService = inject(TranslationService);
  
  toggleLanguage(): void {
    this.translationService.toggleLanguage();
  }
  
  get currentLanguageLabel(): string {
    return this.translationService.currentLanguage().toUpperCase();
  }
}
