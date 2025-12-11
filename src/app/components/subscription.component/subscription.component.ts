import { Component, OnInit, inject, ChangeDetectorRef, ValueEqualityFn } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../services/supabase';
import { Sidebar3 } from '../sidebar3/sidebar3';

interface Plan {
  id: number;
  name: string;
  price: number;
}
interface equipe {
  id1: number;
  name: string;
  
}

interface Subscription {
  id?: number;
  id_utilisateur: number;
  equipe: string;
  plan_name: string;
  price: number;
  startdate: Date | string;
  enddate: Date | string;
  startDate?: Date | string;
  endDate?: Date | string;
  created_at?: string;
  updated_at?: string;
}

@Component({
  selector: 'app-subscription',
  standalone: true,
  imports: [CommonModule, FormsModule , Sidebar3],
  templateUrl: './subscription.component.html',
  styleUrls: ['./subscription.component.css']
})
export class SubscriptionComponent implements OnInit {
  private supabaseService = inject(SupabaseService);
  private cdr = inject(ChangeDetectorRef);

  plans: Plan[] = [
    { id: 1, name: 'Basic', price: 9.99 },
    { id: 2, name: 'Premium', price: 24.99 },
    { id: 3, name: 'VIP', price: 49.99 }
  ];
  equipes: equipe[] = [
    { id1: 1, name: 'FC Bayern'},
    { id1: 2, name: 'FC Liverpool'},
    { id1: 3, name: 'FC Barcelona'},
    { id1: 4, name: 'Real Madrid'},
    { id1: 5, name: 'Manchester United'},
    { id1: 6, name: 'Juventus'},
    { id1: 7, name: 'Paris Saint-Germain'},
    { id1: 8, name: 'Chelsea FC'},
    { id1: 9, name: 'Arsenal FC'},
    { id1: 10, name: 'AC Milan'},
    { id1: 11, name: 'Inter Milan'},
    { id1: 12, name: 'Borussia Dortmund'},
    { id1: 13, name: 'Atletico Madrid'},
    { id1: 14, name: 'Tottenham Hotspur'},
    { id1: 15, name: 'Manchester City'},
    { id1: 16, name: 'AS Roma'},
    { id1: 17, name: 'Napoli' },
    { id1: 18, name: 'Sevilla FC'},
    { id1: 19, name: 'Ajax Amsterdam'},
    { id1: 20, name: 'Lyon FC'}
  ];

  activeSubscription: Subscription[] = [];
  userId: number = 1; // Default user ID
  connectedUserId: number = 0;
  formData = {
    nom: '',
    prenom: '',
    email: ''
  };

  selectedequipe: string = '';
  selectedPlan: string = '';
  message: string = '';

  ngOnInit() {
    this.loadUserSubscription();
  }

  async loadUserSubscription() {
    try {
      this.connectedUserId = await this.supabaseService.getConnectedUserId();
      console.log('Loading subscriptions for user ID:', this.connectedUserId);
      const subscriptions = await this.supabaseService.getAbonnementByUserId(this.connectedUserId);
      console.log('Subscriptions data retrieved:', subscriptions);
      if (subscriptions && subscriptions.length > 0) {
        this.activeSubscription = subscriptions.map(sub => ({
          id: sub.id,
          id_utilisateur: sub.id_utilisateur,
          equipe: sub.equipe,
          plan_name: sub.plan_name,
          price: sub.price,
          startdate: sub.startdate,
          enddate: sub.enddate,
          created_at: sub.created_at,
          updated_at: sub.updated_at
        }));
        console.log('Subscriptions loaded:', this.activeSubscription);
        console.log('First subscription dates:', this.activeSubscription[0]?.startdate, this.activeSubscription[0]?.enddate);
        this.cdr.detectChanges();
      } else {
        console.log('No subscriptions found for this user');
        this.activeSubscription = [];
      }
    } catch (error) {
      console.error('Error loading subscriptions:', error);
    }
  }

  async onSubmit() {
    if (!this.formData.nom || !this.formData.prenom || !this.formData.email || !this.selectedPlan || !this.selectedequipe) {
      alert('Tous les champs sont requis');
      return;
    }

    try {

      console.log('Checking email:', this.formData.email);
      let foundUserId = await this.supabaseService.getUserIdByEmail(this.formData.email);
      console.log('Result from getUserIdByEmail:', foundUserId);
      

      if (!foundUserId) {
        console.log('Email not found, getting next available user ID');
        const lastUserId = await this.supabaseService.getLastUserId();
        foundUserId = lastUserId + 1;
        console.log('Next user ID will be:', foundUserId);
      }

      this.userId = foundUserId;
      console.log('User ID for subscription:', this.userId);

      const existingSubscriptions = await this.supabaseService.getAbonnementByUserId(this.userId);
      if (existingSubscriptions && existingSubscriptions.length > 0) {
        const duplicateTeam = existingSubscriptions.find(sub => sub.equipe === this.selectedequipe);
        if (duplicateTeam) {
          alert('Vous avez déjà un abonnement pour cette équipe!');
          return;
        }
      }

      const plan = this.plans.find(p => p.id === Number(this.selectedPlan));
      if (!plan) return;

      const today = new Date();
      const endDate = new Date(today);
      endDate.setMonth(endDate.getMonth() + 1);

      const abonnementData = {
        id_utilisateur: this.userId,
        equipe: this.equipes.find(e => e.id1 === Number(this.selectedequipe))?.name || '',
        plan_name: plan.name,
        price: plan.price,
        startdate: today.toISOString().split('T')[0],
        enddate: endDate.toISOString().split('T')[0]
      };

      console.log('Creating new subscription with data:', abonnementData);
      const newSub = await this.supabaseService.insertAbonnement(abonnementData);
      console.log('Insert result:', newSub);
      
      if (newSub) {
        alert('Abonnement enregistré avec succès !');
        this.formData = { nom: '', prenom: '', email: ''};
        this.selectedPlan = '';
        this.selectedequipe = '';
        this.loadUserSubscription();
      } else {
        alert('Erreur lors de l\'enregistrement de l\'abonnement. Vérifiez la console.');
      }
    } catch (error) {
      console.error('Exception in onSubmit:', error);
      alert('Erreur: ' + (error instanceof Error ? error.message : 'Erreur inconnue'));
    }
  }
}