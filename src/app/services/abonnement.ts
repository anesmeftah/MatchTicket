import { inject, Injectable } from '@angular/core';
import { SupabaseService } from './supabase';

@Injectable({
  providedIn: 'root',
})
export class Abonnement {
  private supabase = inject(SupabaseService);
  
}
