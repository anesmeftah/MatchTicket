import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '' , redirectTo: 'dashboard', pathMatch: 'full'},
    { path: 'dashboard', loadComponent: () => import('./dashboard/dashboard').then(m => m.Dashboard) },
<<<<<<< HEAD
    { 
    path: 'profile', 
    loadComponent: () => import('./components/profile/profile')
      .then(c => c.Profile) 
  },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' }
=======
    { path: 'dashboard/tickets', loadComponent: () => import('./pages/tickets/tickets').then(m => m.Tickets) },
    { path: 'dashboard/matches', loadComponent: () => import('./pages/matches/matches').then(m => m.Matches) },
>>>>>>> 441327b1cc2cd2858f54715e021dd443bd809273
];
