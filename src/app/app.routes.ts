import { Routes } from '@angular/router';
import {RegisterOrganizationComponent} from '../app/features/auth/register-organization/register-organization.component'; 
import {LoginComponent} from '../app/features/auth/login/login.component'; 
import { HomeComponent } from './features/home/home.component';
import { LandingComponent } from './features/landing/landing.component';


export const routes: Routes = [
    { path: '', component: LandingComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterOrganizationComponent },
  { path: 'home', component: HomeComponent},
];
