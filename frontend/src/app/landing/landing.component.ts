import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { RippleModule } from 'primeng/ripple';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
  standalone:true,
  imports: [
    CommonModule,
    ButtonModule, 
    CardModule, 
    RippleModule,
  ],
  animations: [
    trigger('fadeInOut', [
      state('in', style({ opacity: 1 })),
      transition(':enter', [
        style({ opacity: 0 }),
        animate('600ms ease-in'),
      ]),
      transition(':leave', [
        animate('600ms ease-out', style({ opacity: 0 })),
      ]),
    ]),
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateX(-100%)' }),
        animate('400ms ease-in', style({ transform: 'translateX(0)' })),
      ]),
    ]),
  ],

})

export class LandingComponent {
  features = [
    { icon: 'pi-folder', title: 'Explore Projects', description: 'Browse through hundreds of academic projects.' },
    { icon: 'pi-cog', title: 'Run Code', description: 'Run HTML, JS, and PHP code directly in the browser.' },
    { icon: 'pi-download', title: 'Download Files', description: 'Access documents, presentations, and more.' },
  ];

  stats = [
    { value: 120, label: 'Projects Uploaded' },
    { value: 45, label: 'Contributors' },
    { value: 10, label: 'Categories' },
  ];
}
