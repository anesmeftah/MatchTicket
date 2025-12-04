import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Plan {
  id: number;
  name: string;
  price: number;
}

interface Subscription {
  name: string;
  price: number;
  startDate: string;
  endDate: string;
}

@Component({
  selector: 'app-subscription',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './subscription.component.html',
  styleUrls: ['./subscription.component.css']
})
export class SubscriptionComponent {
  plans: Plan[] = [
    { id: 1, name: 'Basic', price: 9.99 },
    { id: 2, name: 'Premium', price: 24.99 },
    { id: 3, name: 'VIP', price: 49.99 }
  ];

  activeSubscriptions: Subscription[] = [];

  formData = {
    nom: '',
    prenom: '',
    email: ''
  };

  selectedPlan: string = '';
  message: string = '';

  onSubmit() {
    if (!this.formData.nom || !this.formData.prenom || !this.formData.email || !this.selectedPlan) {
      this.message = '⚠️ Tous les champs sont requis';
      return;
    }

    const plan = this.plans.find(p => p.id === Number(this.selectedPlan));
    if (!plan) return;

    const today = new Date();
    const endDate = new Date(today);
    endDate.setMonth(endDate.getMonth() + 1);

    const newSub: Subscription = {
      name: plan.name,
      price: plan.price,
      startDate: today.toLocaleDateString('fr-FR'),
      endDate: endDate.toLocaleDateString('fr-FR')
    };

    this.activeSubscriptions.push(newSub);
    this.message = '✓ Abonnement activé avec succès !';
    this.formData = { nom: '', prenom: '', email: '' };
    this.selectedPlan = '';

    setTimeout(() => {
      this.message = '';
    }, 3000);
  }
}