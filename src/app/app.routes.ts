import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '' , redirectTo: 'dashboard', pathMatch: 'full'},
    { path: 'dashboard', loadComponent: () => import('./dashboard/dashboard').then(m => m.Dashboard) },

    {
    path: 'profile', 
    loadComponent: () => import('./components/profile/profile')
      .then(c => c.Profile) 
  },
   {
    path: 'subscription', 
    loadComponent: () => import('./components/subscription.component/subscription.component')
      .then(c => c.SubscriptionComponent) 
  },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },

    { path: 'dashboard/tickets', loadComponent: () => import('./pages/tickets/tickets').then(m => m.Tickets) },
    { path: 'dashboard/matches', loadComponent: () => import('./pages/matches/matches').then(m => m.Matches) },

];
