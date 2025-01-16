import { Component, OnInit,HostListener } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
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
import { projectApi, projectApiM } from '../../utils/axiosInstances';
import { CardModule } from 'primeng/card';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { ImageModule } from 'primeng/image';
import { SplitterModule } from 'primeng/splitter';
import { TabsModule } from 'primeng/tabs';
import { Menu, MenuModule } from 'primeng/menu';
import { TreeNode } from 'primeng/api';
import { TreeModule } from 'primeng/tree';
import { EditorModule } from 'primeng/editor';
import { SafeResourceUrl,DomSanitizer, BrowserModule } from '@angular/platform-browser';
import { TextareaModule } from 'primeng/textarea';
import { DividerModule } from 'primeng/divider';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-project-view',
  standalone: true,
  imports: [
    TabViewModule, ButtonModule, InputTextModule,
    AvatarModule, FileUploadModule, PanelModule,
    DialogModule, TableModule, FormsModule,
    CommonModule, CardModule, ScrollPanelModule,
    ImageModule, SplitterModule, TabViewModule,
    MenuModule, DialogModule, TreeModule,
    EditorModule, TextareaModule, DividerModule,
    RouterModule, TooltipModule
],
  templateUrl: './project-view.component.html',
  styleUrl: './project-view.component.scss',
  // providers:[AppStore]
  
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
  selectedName:string = this.projectData?.name||'Root' ;
  fileMenuItem:any = [
    {
      label:'Upload file to the opened folder',
      icon:'pi pi-file-plus',
      command: ()=>this.triggerFileInput()
      
    },
    {
      label:'New folder',
      icon:'pi pi-folder-plus',
      command: ()=>this.showDialog()
      
    }
  ]
  showUpload:boolean = true;
  structure:TreeNode[] = [];
  selectedFile!: TreeNode;
  contentType:string = '';
  selectedIcon:string = 'pi pi-folder'
  uploadedFiles: File[] = [];
  lateSelectedFolder!:number;
  isFileContentLoading:boolean = false;
  fileContent!:any
  iframeSrc:any =encodeURIComponent("https://docs.google.com/viewer?url=https://www.telusdigital.com/media/the-essential-guide-to-ai-training-data.pdf&embedded=true");
  liked =false;
  currentFileCanRun:boolean =  false;
  runLoading:boolean = false;
  ran = false;
  showConsole = false;
  consoleContent!:any;
  editorConfig: any = {
    toolbar:  [{ 'script': 'sub'}, { 'script': 'super' }], // Hide the toolbar for a coding view
  };
  constructor(private route: ActivatedRoute, private appStore: AppStore,
    private sanitizer: DomSanitizer,
  ) {}

  ngOnInit(): void {
    this.projectId = this.route.snapshot.paramMap.get('id') || '';
    this.fetchProjectData();
    this.checkScreenSize();
    this.fetchProjectData2();
    // @ViewChild('menu') menu: Menu;
    // this.updateEditorContent(this.apiResponse)
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
      this.image = data.image;
      this.structure =  this.buildTree([data.structure])
      
    }
  }

  async fetchProjectData2(){
    const response:any = await projectApi.get(`project/${this.projectId}/`);
    if(response.status===200){
      const data = response.data
      if(data.isAllowed){
        this.isCollaborator = data.isCollaborator;
        this.isProjectOwner = data.isProjectOwner;
        if(data.isCollaborator|| data.isProjectOwner)
          this.showUpload = true
        else 
          this.showUpload=false
      }
    }
  }

  async addComment() {
    if (this.newComment.trim()) {
      const response = await projectApi.post(this.appStore.userLoggedIn?'comment/':'open-comment/',{
        text:this.newComment,
        project:this.projectId
      })
      if(response.status===201){
        this.fetchProjectData();
        this.newComment = ''
      }
      //   .post(`/api/projects/${this.projectId}/comments`, { comment: this.newComment })
      //   .toPromise();
      // if (response) {
      //   this.comments.push(response);
      //   this.newComment = '';
      // }
    }
  }
  async toggleLike() {
    let response
    if(this.appStore.userLoggedIn){
      response = await projectApi.post('like-item/',{
        type:'project',
        id:this.projectId
      });
    }else{
      response = await projectApi.post('open-like-item/',{
        type:'project',
        id:this.projectId,
        liked:this.liked
      });
    }
    if (response.status===201||response.status===200){
      this.fetchProjectData()
    }
  }

  async saveSettings(settings: any) {
    // const response = await this.http.put(`/api/projects/${this.projectId}/settings`, settings).toPromise();
    // if (response) {
    //   this.projectData = { ...this.projectData, ...settings };
    // }
  }

  async createFolder(parent:string = ''){
    let p:any;
    if(this.contentType==='folder'){
      p =this.lateSelectedFolder
    }
    const response = await projectApi.post('folder/',{
      name:this.newFolderName,
      parent_folder:(p ===undefined ||p==='root')?null:p,
      project:p===undefined?this.projectId:null
    })
    if (response.status===201){
      this.showCreateFolder = false;
      this.fetchProjectData()
      const newFolderNode:any = this.findNodeByKey(response.data.id, this.structure);
      this.selectedFile = newFolderNode;
    }
  }

  showDialog(){
    this.showCreateFolder = !this.showCreateFolder
  }

  buildTree(data: any[]): TreeNode[] {
    return data.map(item => {
      const node: TreeNode = {
        key: item.id?.toString()||'root',
        label: item.name,
        type: item.type,
        children: []
      };
      node.children = [];
      // Recursively add subfolders as children
      if (item.subfolders && item.subfolders.length > 0) {
        node.children = [...node.children, ...this.buildTree(item.subfolders)];
      }

      // Add files as children
      if (item.files && item.files.length > 0) {
        console.log('readingF',item.files);
        
        const fileNodes = item.files.map((file: any) => ({
          key: file.id.toString(),
          label: file.name.split('/')[1],
          type: 'file',
          leaf: true,
          children: [],
          icon:"pi pi-file-o",
          data: {
            url:file.file
          }
        }));
        node.children = [...node.children, ...fileNodes];
      }
      if(node.key==='root')node.expanded = true;
      if(node.type==='folder'){
        // node.icon = 'pi pi-folder-open';
        node.collapsedIcon='pi pi-folder'
        node.expandedIcon='pi pi-folder-open'
      }
      return node;
    });
  }

  findNodeByKey(key: any, nodes: TreeNode[]): TreeNode | any {
    for (const node of nodes) {
      if (node.key === key) {
        return node; // Found the node
      }
      if (node.children && node.children.length > 0) {
        const childNode = this.findNodeByKey(key, node.children);
        if (childNode) {
          return childNode; // Found in children
        }
      }
    }
    return null; // Node not found
  }
  
  
  async onNodeSelect(event:any){
    this.currentFileCanRun = false
    this.showConsole = false;
    this.ran = false;
    this.consoleContent  = ''

    const selectedId = event.node.key;
    const selectedType = event.node.type;
    // console.log(selectedId,selectedType, 'selectedType');
    this.contentType = selectedType;
    this.selectedName= event.node.label
    this.selectedIcon=event.node.expandedIcon;

    if(selectedType==='file'){
      // const response:any = projectApi.get('http://localhost:8000'+event.node.data.url)
      // if(response.status===200){
      //   this.fileContent = response.data
      // }
      const fileName = event.node.label
      if(fileName.endsWith('.cpp')||fileName.endsWith('.php'))
        this.currentFileCanRun = true;
      else
        this.currentFileCanRun = false
      this.iframeSrc = this.sanitizer.bypassSecurityTrustResourceUrl("https://docs.google.com/viewer?url=https://www.telusdigital.com/media/the-essential-guide-to-ai-training-data.pdf&embedded=true");
      // this.iframeSrc = "https://docs.google.com/viewer?url=https://www.telusdigital.com/media/the-essential-guide-to-ai-training-data.pdf&embedded=true"
      // this.iframeSrc = event.node.data.file
    }else{
      console.log(this.selectedFile,'selectedFile');
      this.lateSelectedFolder = event.node.key
      this.currentFileCanRun = false
    }

  }

  async onUpload(event: any) {
    const formData:any = new FormData();
    console.log('event',event);
    
    this.uploadedFiles = event.target.files;

    // Append files to the FormData
    for (const file of this.uploadedFiles) {
      formData.append('files', file);
    }

    // Append additional fields
    formData.append('folder', this.lateSelectedFolder);
    formData.append('project', this.projectData.id);

    // Send the request
    const response:any = await projectApiM.post('file/',formData);
    if(response.status===201){
      this.fetchProjectData()
      this.selectedFile = this.findNodeByKey(this.selectedFile.key,this.structure)
    }
  }

  async runCode() {
    try {
      const file_id = this.selectedFile.key;
  
      // Make API request
      const response: any = await projectApi.post('execute/', { file_id });
  
      // Handle success response
      if (response.status === 200) {
        this.updateEditorContent(response.data); // Update content with output
      }
    } catch (error: any) {
      // Handle error response
      if (error.response?.status === 400) {
        this.updateEditorContent(error.response.data); // Update content with error details
      } else {
        console.error("Unexpected error:", error);
        this.updateEditorContent({
          error: "An unexpected error occurred while executing the code.",
        });
      }
    }
  }
  



  // apiResponse = {
  //   output: "This is the output.\nEverything is working correctly.",
  //   error: "Error: Undefined function 'foo'.\nLine 5: foo();",
  //   warning: "Warning: Variable 'x' is unused.\nLine 3: let x;",
  // };
  updateEditorContent(response: any) {
    const { output, error, warning } = response;

    // Format the content
    this.consoleContent = `
      <pre class="output">${this.escapeHtml(output)}</pre>
      <pre class="error">${this.escapeHtml(error)}</pre>
      <pre class="warning">${this.escapeHtml(warning)}</pre>
    `;
    this.runLoading = false
    this.ran = true;
    this.showConsole = true;
  }

  escapeHtml(input: string): string {
    // Prevent HTML injection by escaping special characters
    const div = document.createElement('div');
    div.innerText = input;
    return div.innerHTML;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.checkScreenSize();
  }

  // Check if the current screen width is considered small
  private checkScreenSize(): void {
    this.isSmallScreen = window.innerWidth <= 768; // Adjust the breakpoint as needed
  }

  triggerFileInput() {
    const fileInput = document.getElementById('hiddenFileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }
}
