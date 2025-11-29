import { Component, inject, signal, OnInit } from '@angular/core';
import { SupabaseService } from '../../services/supabase';
import { Match } from '../../models/match.model';

@Component({
  selector: 'app-matchs-table',
  imports: [],
  templateUrl: './matchs-table.html',
  styleUrl: './matchs-table.css',
})
export class MatchesTable implements OnInit {
  private matchService = inject(SupabaseService);
  protected readonly matches = signal<Match[]>([]);

  async ngOnInit() {
    const data = await this.matchService.getMatches();
    const mappedData: Match[] = data.map((match: any) => ({
      id: match.id,
      homeTeam: match.home_team,
      awayTeam: match.away_team,
      date: match.date,
      venue: match.stadiums?.name || ''
    }));
    this.matches.set(mappedData);
  }
}
