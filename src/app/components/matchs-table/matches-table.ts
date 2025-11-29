import { Component, inject } from '@angular/core';
import { MatchService } from '../../services/match';

@Component({
  selector: 'app-matchs-table',
  imports: [],
  templateUrl: './matchs-table.html',
  styleUrl: './matchs-table.css',
})
export class MatchesTable {
  private matchService = inject(MatchService);

  protected readonly matchs = this.matchService.matches;
}
