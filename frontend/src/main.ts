// src/main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app/app.component';
import { NavbarComponent } from './app/components/navbar/navbar.component';
import { SidebarComponent } from './app/components/sidebar/sidebar.component';
import { UserTableComponent } from './app/components/user-table/user-table.component';
import { ChartsComponent } from './app/components/charts/charts.component';
import { FormsComponent } from './app/components/forms/forms.component';
import { LoginComponent } from './app/pages/login/login.component';
import { DashboardComponent } from './app/pages/dashboard/dashboard.component';
import { UsersComponent } from './app/pages/users/users.component';
import { SettingsComponent } from './app/pages/settings/settings.component';
import { NotFoundComponent } from './app/pages/not-found/not-found.component';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'users', component: UsersComponent },
  { path: 'settings', component: SettingsComponent },
  { path: 'forms', component: FormsComponent },
  { path: 'navbar', component: NavbarComponent },
  { path: 'sidebar', component: SidebarComponent },
  { path: 'charts', component: ChartsComponent },
  { path: 'user-table', component: UserTableComponent },
  { path: '**', component: NotFoundComponent }
];

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),
    importProvidersFrom(RouterModule.forRoot(routes))
  ]
}).catch(err => console.error(err));
