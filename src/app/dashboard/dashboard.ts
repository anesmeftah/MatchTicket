import { Component } from '@angular/core';
import { Sidebar } from '../components/sidebar/sidebar';
import { StatisticsCards } from '../components/statistics-cards/statistics-cards';
import { TicketsTable } from '../components/tickets-table/tickets-table';
import { TopbarComponent } from '../components/topbar/topbar';
import { MatchesTable } from '../components/matchs-table/matches-table';
import { MatchService } from '../services/match';
import { Search } from '../services/search';
import { computed, inject } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  imports: [Sidebar , StatisticsCards , TicketsTable , TopbarComponent, MatchesTable],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {

  private matchService = inject(MatchService);
  private searchService = inject(Search); // Inject SearchService

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
