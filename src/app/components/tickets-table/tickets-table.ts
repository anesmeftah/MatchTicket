import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { SupabaseService } from '../../services/supabase';
import { Ticket } from '../../models/ticket.model';
@Component({
  selector: 'app-tickets-table',
  imports: [CommonModule],
  templateUrl: './tickets-table.html',
  styleUrl: './tickets-table.css',
})
export class TicketsTable {
  private ticketService = inject(SupabaseService);
  protected readonly tickets = signal(<Ticket[]>[]);

  async ngOnInit() {
    const data = await this.ticketService.getSoldTickets();
    const mappedData : Ticket[] = data.map((ticket : any) =>({
      id: ticket.id,
      event: ticket.event,
      date: ticket.date,
      seat: ticket.seat,
      price: ticket.price,
      status: ticket.status
    }));
    this.tickets.set(mappedData);
  }
}
