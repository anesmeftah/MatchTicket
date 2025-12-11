import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../services/supabase';

@Component({
  selector: 'app-ticket-sell',
  templateUrl: './ticket-user.html',
  styleUrls: ['./ticket-user.css']
})
export class TicketUser implements OnInit {
  tickets: any[] = [];
  loading = false;

  showModal = false;
  selectedTicket: any = null;
  buyerEmail = '';

  constructor(private supabaseService: SupabaseService) {}

  ngOnInit(): void {
    this.loadTickets();
  }

  async loadTickets() {
    this.loading = true;
    try {
      const client = this.supabaseService.getClient();
      const { data: userData, error: userErr } = await client.auth.getUser();
      if (userErr || !userData?.user) {
        console.error('No auth user', userErr);
        this.tickets = [];
        this.loading = false;
        return;
      }
      const userId = userData.user.id;

      // adjust 'seller_id' to whatever column references your user in tickets table
      const { data, error } = await client
        .from('tickets')
        .select('id, event, date, seat, price, status, buyer_email')
        .eq('seller_id', userId)
        .order('date', { ascending: true });

      if (error) {
        console.error('Failed to load tickets', error);
        this.tickets = [];
      } else {
        this.tickets = data || [];
      }
    } catch (e) {
      console.error(e);
      this.tickets = [];
    } finally {
      this.loading = false;
    }
  }

  openSellModal(ticket: any) {
    this.selectedTicket = ticket;
    this.buyerEmail = ticket.buyer_email || '';
    this.showModal = true;
  }

  closeModal() {
    this.selectedTicket = null;
    this.buyerEmail = '';
    this.showModal = false;
  }

  async confirmSell() {
    if (!this.selectedTicket) return;
    try {
      const client = this.supabaseService.getClient();
      const update = {
        status: 'sold',
        buyer_email: this.buyerEmail,
        sold_at: new Date().toISOString()
      };

      const { data, error } = await client
        .from('tickets')
        .update(update)
        .eq('id', this.selectedTicket.id)
        .select()
        .single();

      if (error) {
        console.error('Sell update failed', error);
        alert('Failed to mark ticket as sold.');
        return;
      }

      // refresh list
      await this.loadTickets();
      this.closeModal();
    } catch (e) {
      console.error(e);
      alert('Unexpected error');
    }
  }
}