import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';

@Component({
  selector: 'app-text-rotate',
  imports: [],
  templateUrl: './text-rotate.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextRotate { 
  words = input<string[]>(['']);
}
