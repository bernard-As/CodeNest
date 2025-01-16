import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DropdownModule } from 'primeng/dropdown';
import { FieldsetModule } from 'primeng/fieldset';
import { MultiSelectModule } from 'primeng/multiselect';
import { MessageService, SelectItem } from 'primeng/api';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { AppStore } from '../app.store';
import { ButtonModule } from 'primeng/button';
import { accountApiM, projectApi, projectApiM } from '../../utils/axiosInstances';
import { ToastModule } from 'primeng/toast';
import { FileUploadModule } from 'primeng/fileupload';
import { ChipModule } from 'primeng/chip';
import { TextareaModule } from 'primeng/textarea';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-project-setting',
  imports: [CommonModule,DropdownModule,FormsModule,
      FieldsetModule,MultiSelectModule,CardModule,
      ButtonModule,ToastModule,FileUploadModule,
      ChipModule,TextareaModule,],
  templateUrl: './project-setting.component.html',
  styleUrl: './project-setting.component.scss',
  providers:[MessageService]
})
export class ProjectSettingComponent {
  constructor(public appStore: AppStore,
    private messageService: MessageService,
    private route: ActivatedRoute,
) {}
@Input() compactView: boolean = false; // Hides lecturer and advisor fields if true
@Input() isMobile: boolean = false; // Displays a button if true
@Input() projectTypes: SelectItem[] = [];
@Input() collaborators: SelectItem[] = [];
@Input() lecturers: SelectItem[] = [];
@Input() advisors: SelectItem[] = [];
loaded = false;
showForm: boolean = false;
projectId!:any;
project:any = {
  name: '',
  type: null,
  lecturer: null,
  advisor: null,
  image:null,
  description:null,
  tags:[],
};
isProjectOwner = false;
image = null
async getTypes(){
const response = await projectApi.post('types/')

if(response.status===200){
  this.projectTypes = response.data.map((item:any) => ({label: item.name, value: item.id}))
}
}
async getLecturerAdvisors(){
const response = await accountApiM.post('lecturer/')

if(response.status===200){
  this.lecturers = response.data.map((item:any) => ({label: `${item.first_name} ${item.last_name}`, value: item.id}))
  this.advisors = response.data.map((item:any) => ({label: `${item.first_name} ${item.last_name}`, value: item.id}))
}
}

async getUsers(){
const response = await accountApiM.post('users/')

if(response.status===200){
  this.collaborators = response.data.map((item:any) => ({label: item.name, value: item.id}))
}
}


showToast(mess:any) {
this.messageService.add({
  severity: mess.severity,
  summary: mess.summary,
  detail: mess.detail,
  life: mess.life
});

}

isFormValid(): boolean {
return this.project.name.trim() !== '' && this.project.type !== null;
}

onImageUpload(event: any): void {
const input = event.target as HTMLInputElement;
if (input.files && input.files[0]) {
  this.project.image = input.files[0];
}
}

onSubmit(): void {
if (this.isFormValid()) {
  projectApiM.patch('project/'+this.projectId+'/',{ ...this.project,
    'project_type':this.project.type
    // 'collaborators[]':this.project.colaborators
  }).then((res)=>{
    this.showToast({
      severity:'success',
      detail:'Project ['+this.project.name+'] updated successfully!',
      life:3000
    })
    // this.resetForm();
    // if (this.isMobile) {
    //   this.showForm = false;
    // }
  }).catch((error)=>{
      if(error.status===401){
        this.showToast({
          severity:'error',
          summary:'Login Required',
          detail:'You need to login in order to acheive this action',
          life:5000
        })
      }
  })
  // Handle form submission logic here
 
}
}

resetForm(): void {
this.project = {
  name: '',
  type: null,
  lecturer: null,
  advisor: null,
  collaborators: [],
  image: null,
};
}

async fetchProjectData() {
  // Fetch project details
  const response:any = await projectApi.get(`open-project/${this.projectId}/`);
  if (response) {
    const data = response.data
    this.project.collaborators = data.collaborators || [];
    this.project.image = this.image;
    this.project.name = data.name;
    this.project.type=data.project_type.id;
    this.project.lecturer = data.lecturer;
    this.project.advisor = data.advisor;
    this.project.description = data.description
  }
}

async fetchProjectData2(){
  const response:any = await projectApi.get(`project/${this.projectId}/`);
  if(response.status===200){
    const data = response.data
    if(data.isAllowed){
      // this.isCollaborator = data.isCollaborator;
      this.isProjectOwner = data.isProjectOwner;
      this.loaded=true;
      
    }
  }
}

ngOnInit(){
this.isMobile = this.appStore.isMobileDevice()
this.getTypes()
this.getLecturerAdvisors()
this.getUsers()
this.projectId = this.route.snapshot.paramMap.get('id') || '';
this.fetchProjectData();
this.fetchProjectData2();
}
}
