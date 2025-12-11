import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../services/supabase';
import { Sidebar3 } from '../sidebar3/sidebar3';

interface Ticket {
  id: number;
  event: string;
  date: string;
  seat: string;
  section?: string;
  row_number?: number;
  seat_number?: number;
  price: number;
  status: string;
  match_id?: number;
}

interface UserTicket {
  id: number;
  id_user: number;
  event: string;
  date: string;
  seat: string;
  section?: string;
  price: number;
}

@Component({
  selector: 'app-ticket',
  standalone: true,
  imports: [CommonModule, FormsModule, Sidebar3],
  templateUrl: './ticket.component.html',
  styleUrls: ['./ticket.component.css']
})
export class TicketComponent implements OnInit {
  private supabaseService = inject(SupabaseService);
  private cdr = inject(ChangeDetectorRef);

  availableTickets: Ticket[] = [];
  userTickets: UserTicket[] = [];
  loading = false;
  currentUserId: number | null = null;

  showModal = false;
  selectedTicket: Ticket | null = null;
  buyingId: number | null = null;
  connectedUserId: number = 0;

  constructor() {}

  async ngOnInit() {
    console.log('🎫 TicketComponent initialized');
    await this.loadTickets();
  }

  async loadTickets() {
    this.loading = true;
    console.log('📦 Loading tickets...');
    try {
      this.connectedUserId = await this.supabaseService.getConnectedUserId();
      // Load available tickets
      this.availableTickets = await this.supabaseService.getAvailableTickets();
      console.log('✅ Available tickets loaded:', this.availableTickets.length);

      // Load user's purchased tickets (guest user ID = 1)
      const userId = this.connectedUserId ;
      this.userTickets = await this.supabaseService.getUserTickets(userId);
      console.log('✅ User tickets loaded:', this.userTickets.length);
    } catch (error) {
      console.error('❌ Error loading tickets:', error);
    } finally {
      this.loading = false;
    }
  }

  openBuyModal(ticket: Ticket) {
    this.selectedTicket = ticket;
    this.showModal = true;
  }

  closeModal() {
    this.selectedTicket = null;
    this.showModal = false;
  }

  async confirmBuy() {
    if (!this.selectedTicket) {
      alert('No ticket selected');
      return;
    }

    if (this.connectedUserId === 0) {
      alert('Please make sure you are connected');
      return;
    }

    this.buyingId = this.selectedTicket.id;
    this.cdr.detectChanges();

    try {
      console.log('🛒 Starting purchase for ticket:', this.selectedTicket.id, 'User ID:', this.connectedUserId);
      const result = await this.supabaseService.buyTicket(this.connectedUserId, this.selectedTicket.id);
      
      if (result.success) {
        console.log('✅ Purchase successful');
        alert('Ticket purchased successfully!');
        this.closeModal();
        await this.loadTickets();
      } else {
        console.log('❌ Purchase failed:', result.error);
        alert('Error: ' + result.error);
      }
    } catch (error) {
      console.error('❌ Error buying ticket:', error);
      alert('An error occurred while purchasing the ticket');
    } finally {
      this.buyingId = null;
      this.cdr.detectChanges();
    }
  }

  formatPrice(price: number | string): string {
    if (typeof price === 'string') {
      return parseFloat(price).toFixed(2);
    }
    return price.toFixed(2);
  }

  formatDate(date: string): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}
