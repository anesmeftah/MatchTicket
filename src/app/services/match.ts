import { Injectable , signal, inject } from '@angular/core';
import { Match } from '../models/match.model';
import { SupabaseService } from './supabase';

@Injectable({
  providedIn: 'root',
})
export class MatchService {
  private supabase = inject(SupabaseService);
  private matchesSignal = signal<Match[]>([]);

  readonly matches = this.matchesSignal.asReadonly();

  constructor() {
    this.loadMatches();
  }

  async loadMatches() {
    const data = await this.supabase.getMatches();
    const mappedMatches: Match[] = data.map((m: any) => ({
      id: m.id,
      homeTeam: m.home_team,
      awayTeam: m.away_team,
      date: m.date,
      venue: m.stadiums?.name || 'Unknown Venue'
    }));
    this.matchesSignal.set(mappedMatches);
  }
}
