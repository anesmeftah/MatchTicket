
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../services/auth';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class Profile {
  user: User;
  originalUser: User;
  message: string = '';
  errorMessage: string = "";

  constructor(private Auth: Auth) {
    this.user = this.Auth.getUser();
    this.originalUser = { ...this.user };
  }
  

  onSave() {
    if (!this.hasChanges()) {
            this.errorMessage = '❌ Aucune modification détectée';
            this.message = "";
            setTimeout(() => {
                this.errorMessage = "";
            }, 3000);
            return; 
        }
    this.Auth.updateUser(this.user);
    this.message = '✓ Profil mis à jour avec succès !';
     this.errorMessage = "";
        
        this.originalUser = { ...this.user };
        
    setTimeout(() => {
      this.message = '';
    }, 3000);
  }
  onCancel() {
    this.user = this.Auth.getUser();
    this.message = '';
  }
    private hasChanges(): boolean {
        return JSON.stringify(this.user) !== JSON.stringify(this.originalUser);
    }
      getPasswordStars(): string {
    return '*'.repeat(this.user.password.length);
  }
}