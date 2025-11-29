import { Component, inject, signal, OnInit } from '@angular/core';
import { SupabaseService } from '../../services/supabase';
import { CommonModule } from '@angular/common';
import { QuickStats } from '../../models/quickStats.model';

interface MatchStats {
  matchName: string;
  count: number;
}



@Component({
  selector: 'app-statistics-cards',
  imports: [CommonModule],
  templateUrl: './statistics-cards.html',
  styleUrl: './statistics-cards.css',
})
export class StatisticsCards implements OnInit {
  private supabaseService = inject(SupabaseService);
  protected readonly matchStats = signal<MatchStats[]>([]);
  protected readonly maxCount = signal<number>(0);
  protected readonly quickStats = signal<QuickStats>({
    ticketsSold: 0,
    upcomingMatches: 0,
    totalRevenue: 0
  });

  async ngOnInit() {
    await this.loadQuickStats();
    const stats = await this.supabaseService.getTicketsSoldPerMatch();
    this.matchStats.set(stats);
    
    if (stats.length > 0) {
      const max = Math.max(...stats.map(s => s.count));
      this.maxCount.set(max);
    }
  }

  async loadQuickStats() {
    const [ticketsSold, upcomingMatches, totalRevenue] = await Promise.all([
      this.supabaseService.getTotalTicketsSold(),
      this.supabaseService.getUpcomingMatchesCount(),
      this.supabaseService.getTotalRevenue()
    ]);

    this.quickStats.set({
      ticketsSold,
      upcomingMatches,
      totalRevenue
    });
  }

  getBarHeight(count: number): number {
    const max = this.maxCount();
    return max > 0 ? (count / max) * 100 : 0;
  }
}
