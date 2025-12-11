
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../services/supabase';
import { User } from '../../models/user.model';
import { Sidebar2 } from '../sidebar2/sidebar2';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule , Sidebar2],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class Profile implements OnInit {
  private supabaseService = inject(SupabaseService);
  connectedUserId: number = 0;
  user: User | any = {
    id: 1,
    email: '',
    nom: '',
    prenom: '',
    password: ''
  };
  originalUser: User | any = {
    id: 1,
    email: '',
    nom: '',
    prenom: '',
    password: ''
  };
  message: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;

  ngOnInit() {
    
    this.loadUserDataInBackground();
  }
  private async loadUserDataInBackground() {
    try {
      this.connectedUserId = await this.supabaseService.getConnectedUserId();
      const userData = await this.supabaseService.getUser1(this.connectedUserId);
      if (userData) {
        this.user = userData;
        this.originalUser = { ...userData };
        console.log(' User loaded from Supabase:', this.user);
      }
    } catch (error) {
      console.error('Background load error:', error);
    }
  }

  async onSave() {
    if (!this.hasChanges()) {
      alert('Aucune modification détectée');
      return; 
    }

    try {
      console.log('Saving changes to database...');
      const success = await this.supabaseService.updateUser1(this.user);
      if (success) {
        alert('Enregistré avec succès!');
        this.originalUser = { ...this.user };
        this.errorMessage = '';
        console.log('User updated in database:', this.user);
      } else {
        alert('Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur: ' + (error as any).message);
    }
  }

  onCancel() {
    this.user = { ...this.originalUser };
    this.message = '';
    this.errorMessage = '';
  }

  private hasChanges(): boolean {
    return JSON.stringify(this.user) !== JSON.stringify(this.originalUser);
  }

  getPasswordStars(): string {
    return this.user?.password ? '*'.repeat(this.user.password.length) : '';
  }
}