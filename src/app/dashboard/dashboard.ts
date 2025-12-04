import { Component, signal, OnInit } from '@angular/core';
import { Sidebar } from '../components/sidebar/sidebar';
import { StatisticsCards } from '../components/statistics-cards/statistics-cards';
import { TicketsTable } from '../components/tickets-table/tickets-table';
import { TopbarComponent } from '../components/topbar/topbar';
import { MatchesTable } from '../components/matchs-table/matches-table';
import { DashboardChart } from '../components/dashboard-chart/dashboard-chart';
import { MatchService } from '../services/match';
import { Search } from '../services/search';
import { SupabaseService } from '../services/supabase';
import { computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

interface MatchStats {
  matchName: string;
  count: number;
}

@Component({
  selector: 'app-dashboard',
  imports: [Sidebar, StatisticsCards, TicketsTable, TopbarComponent, MatchesTable, DashboardChart, CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private matchService = inject(MatchService);
  private searchService = inject(Search);
  private supabaseService = inject(SupabaseService);
  
  // Dashboard view state: 0 = histogram view, 1 = charts view
  currentView = signal<number>(0);
  readonly totalViews = 2;
  
  // Histogram data
  protected readonly matchStats = signal<MatchStats[]>([]);
  protected readonly maxCount = signal<number>(0);

  async ngOnInit() {
    const stats = await this.supabaseService.getTicketsSoldPerMatch();
    this.matchStats.set(stats);
    
    if (stats.length > 0) {
      const max = Math.max(...stats.map(s => s.count));
      this.maxCount.set(max);
    }
  }

  nextView() {
    this.currentView.update(v => (v + 1) % this.totalViews);
  }

  prevView() {
    this.currentView.update(v => (v - 1 + this.totalViews) % this.totalViews);
  }

  getBarHeight(count: number): number {
    const max = this.maxCount();
    return max > 0 ? (count / max) * 100 : 0;
  }

  // Use computed to filter matches reactively
  protected readonly matches = computed(() => {
    const term = this.searchService.searchTerm().toLowerCase();
    const matches = this.matchService.matches();

    if (!term) return matches;

    return matches.filter(m => 
      m.homeTeam.toLowerCase().includes(term) || 
      m.awayTeam.toLowerCase().includes(term) ||
      m.venue.toLowerCase().includes(term)
    );
  });
}
