
import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Sidebar } from '../../components/sidebar/sidebar';
import { TopbarComponent } from '../../components/topbar/topbar';
import { MatchService } from '../../services/match';
import { TicketService } from '../../services/ticket';
import { Search } from '../../services/search';
import { Match } from '../../models/match.model';

@Component({
  selector: 'app-tickets',
  imports: [Sidebar , TopbarComponent, CommonModule, FormsModule],
  templateUrl: './tickets.html',
  styleUrl: './tickets.css',
})
export class Tickets {
  private matchService = inject(MatchService);
  private ticketService = inject(TicketService);
  private searchService = inject(Search);
  
  selectedMatch = signal<Match | null>(null);
  ticketQuantity = signal<number>(1);
  selectedSeat = signal<string>('A1');
  ticketPrice = signal<number>(100);
  
  totalValue = computed(() => {
    return this.ticketPrice() * this.ticketQuantity();
  });
  
  upcomingMatches = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTime = today.getTime();
    const term = this.searchService.searchTerm().toLowerCase();
    
    let matches = this.matchService.matches()
      .filter(match => {
        const matchDate = new Date(match.date);
        matchDate.setHours(0, 0, 0, 0);
        return matchDate.getTime() >= todayTime;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (term) {
      matches = matches.filter(match =>
        match.homeTeam.toLowerCase().includes(term) ||
        match.awayTeam.toLowerCase().includes(term) ||
        match.venue.toLowerCase().includes(term)
      );
    }

    return matches;
  });

  openBookingModal(match: Match) {
    this.selectedMatch.set(match);
    this.ticketQuantity.set(1);
    this.selectedSeat.set('A1');
    this.updatePrice('A1');
  }

  closeBookingModal() {
    this.selectedMatch.set(null);
  }

  updatePrice(seat: string) {
    this.selectedSeat.set(seat);
    if (seat.startsWith('VIP')) this.ticketPrice.set(200);
    else if (seat.startsWith('A')) this.ticketPrice.set(100);
    else if (seat.startsWith('B')) this.ticketPrice.set(50);
    else this.ticketPrice.set(50);
  }

  async generateTickets() {
    const match = this.selectedMatch();
    if (!match) return;

    const ticketsToAdd = [];
    const section = this.selectedSeat().substring(0, 1);
    const row = parseInt(this.selectedSeat().substring(1)) || 1;
    for(let i=0; i<this.ticketQuantity(); i++) {
        const seatNumber = i + 1;
        ticketsToAdd.push({
            match_id: match.id,
            event: `${match.homeTeam} vs ${match.awayTeam}`,
            date: match.date,
            seat: `${this.selectedSeat()}-${seatNumber}`,
            section: section === 'V' ? 'VIP' : section,
            row_number: row,
            seat_number: seatNumber,
            price: this.ticketPrice(),
            status: 'available'
        });
    }
    
    try {
      await this.ticketService.addTickets(ticketsToAdd);
      this.closeBookingModal();
    } catch (error) {
      console.error('Failed to generate tickets', error);
    }
  }
}
