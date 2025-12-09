import { Routes } from '@angular/router';
import { AuthComponent } from './pages/auth/auth.component';

export const routes: Routes = [

  { path: '' , redirectTo: 'auth', pathMatch: 'full'},

  { 
    path: 'dashboard', 
    loadComponent: () => import('./dashboard/dashboard').then(m => m.Dashboard) 
  },

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

  { 
    path: 'dashboard/tickets', 
    loadComponent: () => import('./pages/tickets/tickets').then(m => m.Tickets) 
  },

  { 
    path: 'dashboard/matches', 
    loadComponent: () => import('./pages/matches/matches').then(m => m.Matches) 
  },

  // ✅ Your auth route is HERE (correct location)
  {
    path: 'auth',
    loadComponent: () =>
      import('./pages/auth/auth.component').then(c => c.AuthComponent)
  },

];
