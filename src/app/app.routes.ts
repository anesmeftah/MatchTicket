import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '' , redirectTo: 'dashboard', pathMatch: 'full'},
    { path: 'dashboard', loadComponent: () => import('./dashboard/dashboard').then(m => m.Dashboard) },
    { 
    path: 'profile', 
    loadComponent: () => import('./components/profile/profile')
      .then(c => c.Profile) 
  },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' }
];
