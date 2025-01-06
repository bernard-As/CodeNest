import { Routes } from '@angular/router';
import { LandingComponent } from './landing/landing.component';
import { LoginComponent } from './login/login.component';
import { ProfileComponent } from './profile/profile.component';
import { AppComponent } from './app.component';
import { CreateProjectComponent } from './create-project/create-project.component';
import { ProjectsComponent } from './projects/projects.component';

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
            { path: 'setting', component: ProfileComponent },
            { path: 'create', component: CreateProjectComponent },
        ],
    }, 
];
