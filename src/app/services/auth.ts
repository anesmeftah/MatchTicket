import { Injectable } from '@angular/core';
import { SupabaseService } from "./supabase";
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class Auth {
  constructor(private supabase: SupabaseService) {}
  private user: User = {
    id: 1 ,
    nom: 'Dupont',
    prenom: 'Jean',
    email: 'jean.dupont@example.com',
    password: '123456'
  };
  getUser(): User {
    return this.user;
  }

  updateUser(newUser: User): void {
    this.user = newUser;
  }

async getCurrentUser(): Promise<User> {
    try {
      const authUser = await this.supabase.getCurrentAuthUser();
      
      if (authUser) {
        // Ici vous devez déterminer l'ID number depuis l'email ou autre identifiant
        const userData = await this.findUserByEmail(authUser.email);
        
        if (userData) {
          return {
            id: userData.id, // ← number depuis Supabase
            email: userData.email,
            nom: userData.nom || '',
            prenom: userData.prenom || '',
            password: ''
          };
        }
      }

      return this.getFallbackUser();
    } catch (error) {
      console.error('Erreur getCurrentUser:', error);
      return this.getFallbackUser();
    }
  }

  // Nouvelle méthode pour trouver l'user par email
  private async findUserByEmail(email: string | undefined) {
    if (!email) return null;
    
    const { data, error } = await this.supabase.getClient()
      .from('user')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      console.error('Erreur findUserByEmail:', error);
      return null;
    }
    return data;
  }

  async updateUser1(user1: User): Promise<boolean> {
    try {
      await this.supabase.updateUser1({
        id: user1.id, // ← number
        email: user1.email,
        nom: user1.nom,
        prenom: user1.prenom
      });
      return true;
    } catch (error) {
      console.error('Erreur updateUser:', error);
      return false;
    }
  }

  private getFallbackUser(): User {
    return {
      id: 1, // ← number
      email: 'maindf@gmail.com',
      nom: 'Nom',
      prenom: 'Prénom',
      password: ''
    };
  }

}