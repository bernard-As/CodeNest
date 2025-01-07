import { Component, OnInit,HostListener } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TabViewModule } from 'primeng/tabview';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AvatarModule } from 'primeng/avatar';
import { FileUploadModule } from 'primeng/fileupload';
import { PanelModule } from 'primeng/panel';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AppStore } from '../app.store';
import { projectApi } from '../../utils/axiosInstances';
import { CardModule } from 'primeng/card';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { ImageModule } from 'primeng/image';

@Component({
  selector: 'app-project-view',
  standalone: true,
  imports: [
    TabViewModule,ButtonModule,InputTextModule,
    AvatarModule,FileUploadModule,PanelModule,
    DialogModule,TableModule,FormsModule,
    CommonModule,CardModule,ScrollPanelModule,
    ImageModule,
  ],
  templateUrl: './project-view.component.html',
  styleUrl: './project-view.component.scss',
  
})
export class ProjectViewComponent {
  projectId: string = '';
  projectData: any = null;
  comments: any[] = [];
  likes: any[] = [];
  metrics: any = {};
  collaborators: any[] = [];
  isSmallScreen:any = null;
  isProjectOwner: boolean = false;
  showFloatingPanel: boolean = false;
  newComment: string = '';
  image:any = 'codenest.webp';
  constructor(private route: ActivatedRoute, private appStore: AppStore) {}

  ngOnInit(): void {
    this.projectId = this.route.snapshot.paramMap.get('id') || '';
    this.fetchProjectData();
    this.checkScreenSize()
  }

  async fetchProjectData() {
    // Fetch project details
    const response:any = await projectApi.get(`open-project/${this.projectId}/`);
    if (response) {
      const data = response.data
      this.projectData = data;
      this.comments = data.comments || [];
      this.likes = data.likes || [];
      this.metrics = data.metrics || {};
      this.isProjectOwner = data.is_owner || false;
      this.collaborators = data.collaborators || [];
      this.metrics.likes = data.likes;
      this.metrics.comments = data.comments;
      this.image = data.image
    }
  }

  async addComment() {
    if (this.newComment.trim()) {
      // const response = await this.http
      //   .post(`/api/projects/${this.projectId}/comments`, { comment: this.newComment })
      //   .toPromise();
      // if (response) {
      //   this.comments.push(response);
      //   this.newComment = '';
      // }
    }
  }
  async toggleLike() {
    // const response:any = await this.http.post(`/api/projects/${this.projectId}/like`, {}).toPromise();
    // if (response) {
    //   this.metrics.likes += response.liked ? 1 : -1;
    // }
  }

  async saveSettings(settings: any) {
    // const response = await this.http.put(`/api/projects/${this.projectId}/settings`, settings).toPromise();
    // if (response) {
    //   this.projectData = { ...this.projectData, ...settings };
    // }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.checkScreenSize();
  }

  // Check if the current screen width is considered small
  private checkScreenSize(): void {
    this.isSmallScreen = window.innerWidth <= 768; // Adjust the breakpoint as needed
  }
}
