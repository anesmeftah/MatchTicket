
import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Sidebar } from '../../components/sidebar/sidebar';
import { TopbarComponent } from '../../components/topbar/topbar';
import { MatchService } from '../../services/match';
import { TicketService } from '../../services/ticket';
import { Search } from '../../services/search';
import { Match } from '../../models/match.model';

@Component({
  selector: 'app-tickets',
  imports: [Sidebar , TopbarComponent, CommonModule, ReactiveFormsModule],
  templateUrl: './tickets.html',
  styleUrl: './tickets.css',
})
export class Tickets implements OnInit {
  private matchService = inject(MatchService);
  private ticketService = inject(TicketService);
  private searchService = inject(Search);
  private fb = inject(FormBuilder);
  
  selectedMatch = signal<Match | null>(null);
  ticketForm!: FormGroup;
  
  totalValue = computed(() => {
    if (!this.ticketForm) return 0;
    const quantity = this.ticketForm.get('quantity')?.value || 0;
    const price = this.ticketForm.get('price')?.value || 0;
    return price * quantity;
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

  constructor() {
    this.initForm();
  }

  async ngOnInit() {
    // Ensure matches are loaded when component initializes
    await this.matchService.loadMatches();
  }

  initForm() {
    this.ticketForm = this.fb.group({
      quantity: [1, [Validators.required, Validators.min(1)]],
      price: [100, [Validators.required, Validators.min(0)]],
      section: ['A1', Validators.required]
    });

    // Subscribe to section changes to update price
    this.ticketForm.get('section')?.valueChanges.subscribe(seat => {
      this.updatePrice(seat);
    });
  }

  openBookingModal(match: Match) {
    this.selectedMatch.set(match);
    this.ticketForm.patchValue({
      quantity: 1,
      section: 'A1',
      price: 100
    });
  }

  closeBookingModal() {
    this.selectedMatch.set(null);
  }

  updatePrice(seat: string) {
    let price = 50;
    if (seat.startsWith('VIP')) price = 200;
    else if (seat.startsWith('A')) price = 100;
    else if (seat.startsWith('B')) price = 50;
    
    this.ticketForm.patchValue({ price }, { emitEvent: false });
  }

  incrementQuantity() {
    const current = this.ticketForm.get('quantity')?.value || 1;
    this.ticketForm.patchValue({ quantity: current + 1 });
  }

  decrementQuantity() {
    const current = this.ticketForm.get('quantity')?.value || 1;
    if (current > 1) {
      this.ticketForm.patchValue({ quantity: current - 1 });
    }
  }

  async generateTickets() {
    const match = this.selectedMatch();
    if (!match || this.ticketForm.invalid) return;

    const formValue = this.ticketForm.value;
    const ticketsToAdd = [];
    const section = formValue.section.substring(0, 1);
    const row = parseInt(formValue.section.substring(1)) || 1;
    
    for(let i=0; i<formValue.quantity; i++) {
        const seatNumber = i + 1;
        ticketsToAdd.push({
            match_id: match.id,
            event: `${match.homeTeam} vs ${match.awayTeam}`,
            date: match.date,
            seat: `${formValue.section}-${seatNumber}`,
            section: section === 'V' ? 'VIP' : section,
            row_number: row,
            seat_number: seatNumber,
            price: formValue.price,
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
