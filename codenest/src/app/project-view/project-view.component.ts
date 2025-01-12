import { Component, OnInit,HostListener } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TabPanel, TabViewModule } from 'primeng/tabview';
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
import { SplitterModule } from 'primeng/splitter';
import { TabsModule } from 'primeng/tabs';
import { MenuModule } from 'primeng/menu';
@Component({
  selector: 'app-project-view',
  standalone: true,
  imports: [
    TabViewModule,ButtonModule,InputTextModule,
    AvatarModule,FileUploadModule,PanelModule,
    DialogModule,TableModule,FormsModule,
    CommonModule,CardModule,ScrollPanelModule,
    ImageModule,SplitterModule,TabViewModule,
    MenuModule,DialogModule
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
  isCollaborator: boolean = false;
  showFloatingPanel: boolean = false;
  newComment: string = '';
  image:any = 'codenest.webp';
  showCreateFolder: boolean = false;
  newFolderName: string = '';
  fileMenuItem:any = [
    {
      label:'Upload file',
      icon:'pi pi-file-plus',
      command: ()=>console.log('upload file')
      
    },
    {
      label:'New folder',
      icon:'pi pi-folder-plus',
      command: ()=>this.showDialog()
      
    }
  ]


  constructor(private route: ActivatedRoute, private appStore: AppStore) {}

  ngOnInit(): void {
    this.projectId = this.route.snapshot.paramMap.get('id') || '';
    this.fetchProjectData();
    this.checkScreenSize();
    this.fetchProjectData2();
  }

  async fetchProjectData() {
    // Fetch project details
    const response:any = await projectApi.get(`open-project/${this.projectId}/`);
    if (response) {
      const data = response.data
      this.projectData = data;
      this.comments = data.comments_data || [];
      this.likes = data.likes_data || [];
      this.metrics = data.metrics || {};
      this.collaborators = data.collaborators || [];
      this.metrics.likes = data.likes;
      this.metrics.comments = data.comments;
      this.image = data.image
    }
  }

  async fetchProjectData2(){
    const response:any = await projectApi.get(`project/${this.projectId}/`);
    if(response.status===200){
      const data = response.data
      if(data.isAllowed){
        this.isCollaborator = data.isCollaborator;
        this.isProjectOwner = data.isProjectOwner;
      }
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

  async createFolder(parent:string = ''){
    const response = await projectApi.post('folder/',{
      name:this.newFolderName,
      parent_folder:parent ===''?null:parent,
      project:parent ===''?this.projectId:null
    })
    if (response.status===201){
      this.showCreateFolder = false;
    }
  }

  showDialog(){
    this.showCreateFolder = !this.showCreateFolder
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
