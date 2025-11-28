import { Injectable, signal } from '@angular/core';
import { Ticket } from '../models/ticket.model';

@Injectable({
  providedIn: 'root',
})
export class TicketService {
  private ticketsSignal = signal<Ticket[]>([
    {
      id: 1,
      event: 'Champions League Final',
      date: '2024-06-01',
      seat: 'A12',
      price: 150,
      status: 'sold'
    },
    {
      id: 2,
      event: 'Premier League Match',
      date: '2024-05-15',
      seat: 'B5',
      price: 75,
      status: 'sold'
    }
  ]);

  readonly tickets = this.ticketsSignal.asReadonly();
  
  getTickets(){
    return this.tickets();
  }

  addTicket(ticket: Ticket){
    this.ticketsSignal.update(tickets => [...tickets, ticket]);
  }
}
