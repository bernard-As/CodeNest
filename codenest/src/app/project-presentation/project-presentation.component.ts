import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { SplitterModule } from 'primeng/splitter';
@Component({
  selector: 'app-project-presentation',
  standalone: true,
  imports: [SplitterModule,CommonModule],
  templateUrl: './project-presentation.component.html',
  styleUrl: './project-presentation.component.scss'
})
export class ProjectPresentationComponent {

}
