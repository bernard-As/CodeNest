import { Routes } from '@angular/router';
import { LandingComponent } from './landing/landing.component';
import { LoginComponent } from './login/login.component';
import { ProfileComponent } from './profile/profile.component';
import { AppComponent } from './app.component';
import { CreateProjectComponent } from './create-project/create-project.component';
import { ProjectsComponent } from './projects/projects.component';
import { ProjectViewComponent } from './project-view/project-view.component';
import { ProjectPresentationComponent } from './project-presentation/project-presentation.component';
import { ProjectSettingComponent } from './project-setting/project-setting.component';

export const routes: Routes = [
    { path: '', component: AppComponent }, 
    { path: 'home', component: AppComponent }, 
    { path: 'landing', component: LandingComponent }, 
    { path: 'login', component: LoginComponent }, 
    { path: 'profile', component: ProfileComponent }, 
    { 
        path: 'projects', 
        children: [
            { path: '', component: ProjectsComponent },
            { path: 'create', component: CreateProjectComponent },
            { path: 'setting',
                children:[
                  { path: ':id', component: ProjectSettingComponent },
                  
                ]
            },
            {path:'presentation', component: ProjectPresentationComponent},
            { 
                path: 'presentation', 
                children:[
                    {path:'main', component: ProjectPresentationComponent},
                    {path:':id', component: ProjectPresentationComponent},
                ]
            },
            { path: ':id', component: ProjectViewComponent },
        ],
    }, 
];
