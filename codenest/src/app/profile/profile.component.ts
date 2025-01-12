import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AvatarModule } from 'primeng/avatar';
import { CardModule } from 'primeng/card';
import { FileUploadModule } from 'primeng/fileupload';
import { DividerModule } from 'primeng/divider';
import { PanelModule } from 'primeng/panel';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { AppStore } from '../app.store';
import { accountApiM } from '../../utils/axiosInstances';
import { autorun } from 'mobx';
import { TooltipModule } from 'primeng/tooltip';
import { MultiSelectModule } from 'primeng/multiselect';
@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,CardModule,FormsModule,
    FileUploadModule,DividerModule,PanelModule,
    InputTextModule,DropdownModule,AvatarModule,
    ButtonModule,MultiSelectModule,
    TooltipModule,
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
  constructor(public appStore: AppStore,
  ) {}
  profilePicture: string = 'https://via.placeholder.com/150';
  firstName: string = 'John';
  lastName: string = 'Doe';
  department: any = 0;
  tags: string[] = [];
  profilePictureModified = false;
  profilePictureHolder:any;
  departments:any = [];
  departmentName:any = this.departments.find((d:any)=>d.value===this.department)?.name

  // Handle profile picture upload
  onUpload(event: any) {
    this.profilePictureHolder = event.files
    const file = event.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      this.profilePicture = reader.result as string;
      this.appStore.user.image= reader.result as string;
    };
    reader.readAsDataURL(file);
    this.profilePictureModified = true
  }

  // Save profile changes
  
  async saveProfile() {
    const formData = new FormData();

  // Append text fields
  formData.append('first_name', this.firstName);
  formData.append('last_name', this.lastName);
  formData.append('department', this.department);
  
  // Append tags array as JSON string
  formData.append('tags', JSON.stringify(this.tags));

  // Append the profile picture file (ensure it's the first file in the array)
  if (this.profilePictureHolder && this.profilePictureHolder.length > 0) {
    formData.append('image', this.profilePictureHolder[0]);
  }

    const response = await accountApiM.post('update-profile/',formData)

    if(response.status===200){
      alert('success')
    }else{
      console.log(response)
    }
    console.log('Profile updated:', {
      first_name: this.firstName,
      last_lame: this.lastName,
      department: this.department,
      tags: this.tags,
    });
    this.profilePictureModified = false
    this.appStore.verifyToken()
  }

  async getDepartments(){
    const res = await accountApiM.get('department/')
    if(res.status===200)
      this.departments = res.data.map((d:any)=>({
          label:d.name,
          value:d.id
        }))
    this.updateDepartmentName()
    
  }

  updateDepartmentName(){
    console.log(this.department);
    
    this.departmentName = this.departments.find((d:any)=>d.value===this.department)?.label
    
  }

  initializevaluse(){
    autorun(() => {
      this.firstName = this.appStore.user.first_name;
      this.lastName = this.appStore.user.last_name;
      this.profilePicture = this.appStore.user.image;
      this.department = this.appStore.user.department;
      this.tags = this.appStore.user.tags;
      this.updateDepartmentName()
  });
  }
  ngOnInit(){
    this.getDepartments()
    this.initializevaluse()
  }
}
