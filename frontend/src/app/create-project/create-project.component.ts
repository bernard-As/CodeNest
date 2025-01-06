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
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ChipModule } from 'primeng/chip';

@Component({
  selector: 'app-create-project',
  standalone: true,
  imports: [
    CommonModule,DropdownModule,FormsModule,
    FieldsetModule,MultiSelectModule,CardModule,
    ButtonModule,ToastModule,FileUploadModule,
    InputTextareaModule,ChipModule
  ],
  templateUrl: './create-project.component.html',
  styleUrl: './create-project.component.scss',
  providers:[MessageService]
})
export class CreateProjectComponent {
  constructor(public appStore: AppStore,
        private messageService: MessageService
  ) {}
  @Input() compactView: boolean = false; // Hides lecturer and advisor fields if true
  @Input() isMobile: boolean = false; // Displays a button if true
  @Input() projectTypes: SelectItem[] = [];
  @Input() collaborators: SelectItem[] = [];
  @Input() lecturers: SelectItem[] = [];
  @Input() advisors: SelectItem[] = [];

  showForm: boolean = false;

  project:any = {
    name: '',
    type: null,
    lecturer: null,
    advisor: null,
    image:null,
    description:null,
    tags:[]
  };

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
      projectApiM.post('project/',{ ...this.project,
        'project_type':this.project.type
        // 'collaborators[]':this.project.colaborators
      }).then((res)=>{
        this.showToast({
          severity:'success',
          detail:'Project ['+this.project.name+'] created successfully!',
          life:3000
        })
        this.resetForm();
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

  ngOnInit(){
    this.isMobile = this.appStore.isMobileDevice()
    this.getTypes()
    this.getLecturerAdvisors()
    this.getUsers()
  }
}
