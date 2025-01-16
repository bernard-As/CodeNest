import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { WebSocketSubject } from 'rxjs/webSocket';
import { MessageService } from 'primeng/api';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { FormsModule } from '@angular/forms';
import { FieldsetModule } from 'primeng/fieldset';

@Component({
  selector: 'app-project-presentation',
  standalone: true,
  imports: [CommonModule,ButtonModule,TextareaModule,
    ToastModule,FormsModule,FieldsetModule
    

  ],
  templateUrl: './project-presentation.component.html',
  styleUrl: './project-presentation.component.scss'
})
export class ProjectPresentationComponent {
  @Input() isProjectCreator: boolean = false;
  @Input() isCollaborator: boolean = false;
  @Input() fileContentUrl: string = ''; // URL of the file content
  @Input() projectId: number = 0;

  isPresenting: boolean = false;
  message: string = '';
  sanitizedFileContent!: SafeResourceUrl;
  private websocket!: WebSocketSubject<any>;

  constructor(
    private messageService: MessageService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    // this.primengConfig.ripple = true;

    // Sanitize the file URL for iframe usage
    this.sanitizedFileContent = this.sanitizer.bypassSecurityTrustResourceUrl(this.fileContentUrl);

    // Initialize WebSocket connection
    this.websocket = new WebSocketSubject(`ws://localhost:8000/ws/project/${this.projectId}/`);

    // Listen for incoming messages
    this.websocket.subscribe((data) => {
      if (data.type === 'message') {
        this.messageService.add({ severity: 'info', summary: 'Message', detail: data.message });
      }
    });
  }

  startPresentation() {
    this.isPresenting = true;
  }

  stopPresentation() {
    this.isPresenting = false;
  }

  sendMessage() {
    if (this.message.trim()) {
      this.websocket.next({ type: 'message', message: this.message });
      this.message = ''; // Clear input
    }
  }

  ngOnDestroy() {
    if (this.websocket) {
      this.websocket.complete(); // Close WebSocket connection
    }
  }
}
