import { Component, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services';



@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent {
  @ViewChild('containerRef', { static: false }) container!: ElementRef;

  signInEmail = '';
  signInPassword = '';
  signUpNom = '';
  signUpPrenom = '';
  signUpEmail = '';
  signUpPassword = '';
  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private supabaseService: SupabaseService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  onSignUp() {
    if (this.container) {
      this.container.nativeElement.classList.add('right-panel-active');
    }
    this.clearMessages();
  }

  onSignIn() {
    if (this.container) {
      this.container.nativeElement.classList.remove('right-panel-active');
    }
    this.clearMessages();
  }

  async handleSignIn() {
    if (!this.signInEmail || !this.signInPassword) {
      this.errorMessage = 'Veuillez remplir tous les champs';
      return;
    }

    this.loading = true;
    this.clearMessages();
    this.cdr.detectChanges();

    try {
      const result = await this.supabaseService.signInWithUsersTable(
        this.signInEmail,
        this.signInPassword
      );

      this.loading = false;
      this.cdr.detectChanges();

      if (result.success) {
        this.successMessage = 'Connexion réussie !';
        console.log('✅ User signed in:', result.data);
        
        // Check if user is admin
        const isAdmin = result.data?.isadmin === 1 || result.data?.isadmin === true;
        const redirectPath = isAdmin ? '/dashboard' : '/ticket';
        
        setTimeout(() => {
          this.router.navigate([redirectPath]);
        }, 1000);
      } else {
        this.errorMessage = result.error || 'An error occurred';
        console.log('❌ Sign in failed:', result.error);
        this.cdr.detectChanges();
      }
    } catch (error) {
      console.error('❌ Exception during sign in:', error);
      this.errorMessage = 'An unexpected error occurred';
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  async handleSignUp() {
    if (!this.signUpNom || !this.signUpPrenom || !this.signUpEmail || !this.signUpPassword) {
      this.errorMessage = 'Veuillez remplir tous les champs';
      return;
    }

    if (this.signUpPassword.length < 6) {
      this.errorMessage = 'Le mot de passe doit contenir au moins 6 caractères';
      return;
    }

    this.loading = true;
    this.clearMessages();

    const { data, error } = await this.supabaseService.signUpWithPassword(
      this.signUpEmail,
      this.signUpPassword,
      this.signUpNom,
      this.signUpPrenom
    );

    this.loading = false;

    if (error) {
      this.errorMessage = this.getErrorMessage(error.message);
    } else {
      this.successMessage = 'Compte créé avec succès !';
      this.signUpNom = '';
      this.signUpPrenom = '';
      this.signUpEmail = '';
      this.signUpPassword = '';
      
      setTimeout(() => {
        this.onSignIn();
        this.clearMessages();
      }, 2000);
    }
  }

  private getErrorMessage(errorMsg: string): string {
    if (errorMsg.includes('Invalid login credentials')) {
      return 'Email ou mot de passe incorrect';
    }
    if (errorMsg.includes('User already registered')) {
      return 'Cet email est déjà utilisé';
    }
    if (errorMsg.includes('Email not confirmed')) {
      return 'Veuillez confirmer votre email';
    }
    if (errorMsg.includes('Email rate limit exceeded')) {
      return 'Trop de tentatives. Réessayez plus tard';
    }
    return 'Une erreur est survenue. Réessayez.';
  }

  private clearMessages() {
    this.errorMessage = '';
    this.successMessage = '';
  }
}