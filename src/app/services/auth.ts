import { Injectable } from '@angular/core';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class Auth {
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
}