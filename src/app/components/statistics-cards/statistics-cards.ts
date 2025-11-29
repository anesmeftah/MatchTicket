import { Component, inject, signal, OnInit } from '@angular/core';
import { SupabaseService } from '../../services/supabase';

interface MatchStats {
  matchName: string;
  count: number;
}

@Component({
  selector: 'app-statistics-cards',
  imports: [],
  templateUrl: './statistics-cards.html',
  styleUrl: './statistics-cards.css',
})
export class StatisticsCards implements OnInit {
  private supabaseService = inject(SupabaseService);
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

  getBarHeight(count: number): number {
    const max = this.maxCount();
    return max > 0 ? (count / max) * 100 : 0;
  }
}
