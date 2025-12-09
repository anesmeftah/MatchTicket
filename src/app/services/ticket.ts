import { Injectable, signal, inject } from '@angular/core';
import { Ticket } from '../models/ticket.model';
import { SupabaseService } from './supabase';

@Injectable({
  providedIn: 'root',
})
export class TicketService {
  private supabase = inject(SupabaseService);
  private ticketsSignal = signal<Ticket[]>([]);

  readonly tickets = this.ticketsSignal.asReadonly();
  
  getTickets(){
    return this.tickets();
  }

  async addTickets(tickets: any[]){
    try {
      const data = await this.supabase.addTickets(tickets);
      if(data) {
         return data;
      }
      return null;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
