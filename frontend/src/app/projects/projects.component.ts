import { CommonModule,} from '@angular/common';
import { Component,OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import baseApi, { projectApi } from '../../utils/axiosInstances';
import { ChipModule } from 'primeng/chip';
import { TooltipModule } from 'primeng/tooltip';
import { AppStore } from '../app.store';
import { RouterModule,Router } from '@angular/router';
@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [
    CommonModule, CardModule, InputTextModule,
    DropdownModule, ButtonModule, DividerModule,
    FormsModule,ChipModule,TooltipModule,
    RouterModule
  ],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss'
})
export class ProjectsComponent  implements OnInit {
  projects: any[] = [];
  filteredProjects: any[] = [];
  searchQuery: string = '';
  filterCategory: string | null = null;
  likedProjects:any[] = [];
  categories: any[] = [
    { label: 'All', value: null },
    { label: 'Web Development', value: 'Web Development' },
    { label: 'Machine Learning', value: 'Machine Learning' },
    { label: 'Data Science', value: 'Data Science' },
    { label: 'Mobile Apps', value: 'Mobile Apps' },
  ];

  constructor(
    public appStore: AppStore,
    private router: Router
  ) {}

  ngOnInit() {
    this.fetchProjects();
    this.fetchProjectsTYpe();
  }
  async fetchProjectsTYpe(){
    const response: any = await projectApi.post('types/');
    this.categories = [
    { label: 'All', value: null },
      ...response.data.map((d:any)=>{
        return{
          label:d.name,
          value:d.name
        }
      })
    ]
  }
  async fetchProjects() {
    // Replace with your API endpoint
    const response: any = await projectApi.get('open-project/');
    this.projects = response.data.map((d:any)=>{
      d.image===null?d.image='codenest.webp':d.image=d.image
      return d;
    }) || [];
    this.filteredProjects = [...this.projects];
  }

  async searchProjects() {
    // this.filteredProjects = this.projects.filter(project =>
    //   project.name.toLowerCase().includes(this.searchQuery.toLowerCase())
    // );
    const response: any = await projectApi.get('open-project/?search='+this.searchQuery);
    this.filteredProjects = response.data.map((d:any)=>{
      d.image===null?d.image='codenest.webp':d.image=d.image
      return d;
    }) || [];
  }

  filterProjects() {
    if (this.filterCategory) {
      this.filteredProjects = this.projects.filter(
        project => project.project_type?.name === this.filterCategory
      );
    } else {
      this.filteredProjects = [...this.projects];
    }
  }
  tooltipText(id:any):string{
    const tags:any = []
    this.projects.find((p:any)=>p.id===id)?.tags.map((t:any)=>tags.push(t.name))
    return tags.join(',')
  }

  async likeProject(id:any){
    const project = this.projects.find((p:any)=>p.id===id)
    const liked = this.likedProjects.includes(id)
    if(!project){
      return
    }
    let response
    if(this.appStore.userLoggedIn){
      response = await projectApi.post('like-item/',{
        type:'project',
        id:id
      });
    }else{
      response = await projectApi.post('open-like-item/',{
        type:'project',
        id:id,
        liked:liked
      });
    }
    if (response.status===201){
      if(liked)
        this.likedProjects.filter((l:any)=>l!==id)
      else
      this.likedProjects.push(id)
    }
  }
  goToProject(id: string) {
    this.router.navigate(['/projects', id]);
  }

}