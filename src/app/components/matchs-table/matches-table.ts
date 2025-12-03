import { Component, computed, inject } from '@angular/core';
import { MatchService } from '../../services/match';
import { Search } from '../../services/search';

@Component({
  selector: 'app-matchs-table',
  imports: [],
  templateUrl: './matchs-table.html',
  styleUrl: './matchs-table.css',
})
export class MatchesTable {
  private matchService = inject(MatchService);
  private searchService = inject(Search);

  protected readonly matches = computed(() => {
    const term = this.searchService.searchTerm().toLowerCase();
    const allMatches = this.matchService.matches();

    if (!term) return allMatches;

    return allMatches.filter(match =>
      match.homeTeam.toLowerCase().includes(term) ||
      match.awayTeam.toLowerCase().includes(term) ||
      match.venue.toLowerCase().includes(term)
    );
  });
}
