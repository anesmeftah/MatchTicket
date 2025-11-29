import { Injectable , signal } from '@angular/core';
import { Match } from '../models/match.model';

@Injectable({
  providedIn: 'root',
})
export class MatchService {
  private matchesSignal = signal<Match[]>(
    [
      {
        id: 1,
        homeTeam: 'Real Madrid',
        awayTeam: 'Liverpool',
        date: '2026-06-01',
        venue: 'Bernabeu'
      },
      {
        id: 2,
        homeTeam: 'Juventus',
        awayTeam: 'AC Milan',
        date: '2026-05-15',
        venue: 'Allianz Stadium'  
      }
    ]
  );

  readonly matches = this.matchesSignal.asReadonly();

}
