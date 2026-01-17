import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-up-bar',
  imports: [RouterLink],
  templateUrl: './up-bar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UpBar { 

}
