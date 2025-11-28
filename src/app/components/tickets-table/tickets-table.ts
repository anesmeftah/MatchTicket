import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { TicketService } from '../../services/ticket';

@Component({
  selector: 'app-tickets-table',
  imports: [CommonModule],
  templateUrl: './tickets-table.html',
  styleUrl: './tickets-table.css',
})
export class TicketsTable {
  private ticketService = inject(TicketService);

  protected readonly tickets = this.ticketService.tickets;
}
