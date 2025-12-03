import { Component, inject, signal, OnInit, effect } from '@angular/core';
import { SupabaseService } from '../../services/supabase';
import { MatchService } from '../../services/match';
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
  private matchService = inject(MatchService);
  protected readonly matchStats = signal<MatchStats[]>([]);
  protected readonly maxCount = signal<number>(0);
  protected readonly quickStats = signal<QuickStats>({
    ticketsSold: 0,
    upcomingMatches: 0,
    totalRevenue: 0
  });

  constructor() {
    effect(() => {
      const count = this.matchService.matches().length;
      this.quickStats.update(stats => ({ ...stats, upcomingMatches: count }));
    });
  }

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
    const [ticketsSold, totalRevenue] = await Promise.all([
      this.supabaseService.getTotalTicketsSold(),
      this.supabaseService.getTotalRevenue()
    ]);

    this.quickStats.update(stats => ({
      ...stats,
      ticketsSold,
      totalRevenue
    }));
  }

  getBarHeight(count: number): number {
    const max = this.maxCount();
    return max > 0 ? (count / max) * 100 : 0;
  }
}
