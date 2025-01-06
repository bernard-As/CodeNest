import { Component } from '@angular/core';
import { ChipModule } from 'primeng/chip';

@Component({
  selector: 'app-project-view',
  standalone: true,
  imports: [ChipModule],
  templateUrl: './project-view.component.html',
  styleUrl: './project-view.component.scss'
})
export class ProjectViewComponent {

}
