import { Injectable , signal, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Match } from '../models/match.model';
import { environment } from '../../environments/environment';
import { SupabaseService } from './supabase';
import { firstValueFrom } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class MatchService {
  private http = inject(HttpClient);
  private supabase = inject(SupabaseService);
  private platformId = inject(PLATFORM_ID);
  private matchesSignal = signal<Match[]>([]);

  readonly matches = this.matchesSignal.asReadonly();

  constructor() {
    this.initialize();
  }

  async initialize() {
    await this.loadMatches();
    if (isPlatformBrowser(this.platformId)) {
      this.syncMatches().then(() => this.loadMatches());
    }
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

  async syncMatches() {
    const headers = new HttpHeaders({
      'X-Auth-Token': environment.footballDataApiKey
    });

    // Calculate the cutoff date (6 months from now)
    const future = new Date();
    future.setMonth(future.getMonth() + 6);
    const cutoffDate = future.getTime();

    try {
      // Fetch all scheduled matches (API limit might apply, but we filter client-side to be safe)
      const response = await firstValueFrom(
        this.http.get<any>(`${environment.footballDataApiUrl}/matches?status=SCHEDULED`, { headers })
      );

      console.log(`Fetched ${response.matches.length} matches from API`);

      const stadiums = await this.supabase.getStadiums();
      let insertedCount = 0;
      
      for (const m of response.matches) {
        const matchDate = new Date(m.utcDate);
        
        // Filter: Skip if match is more than 6 months in the future
        if (matchDate.getTime() > cutoffDate) {
          continue;
        }

        // Use API venue or fallback to Home Team's stadium to avoid "Unknown Venue"
        const venueName = m.venue || `${m.homeTeam.name} Stadium`;
        
        let stadiumId = stadiums.find((s: any) => s.name === venueName)?.id;

        if (!stadiumId) {
          const newStadium = await this.supabase.addStadium(venueName);
          if (newStadium) {
            stadiumId = newStadium.id;
            stadiums.push(newStadium);
          } else {
            console.error(`Failed to resolve stadium: ${venueName}`);
            continue; // Skip this match if stadium cannot be resolved
          }
        }

        // Format date and time
        const dateStr = matchDate.toISOString().split('T')[0]; // YYYY-MM-DD
        const timeStr = matchDate.toTimeString().split(' ')[0]; // HH:MM:SS

        const matchToInsert = {
          home_team: m.homeTeam.name,
          away_team: m.awayTeam.name,
          date: dateStr,
          time: timeStr,
          stadium_id: stadiumId
        };

        const result = await this.supabase.insertMatch(matchToInsert);
        if (result) {
          insertedCount++;
        } else {
          console.error('Failed to insert match:', matchToInsert);
        }
      }
      console.log(`Synced ${insertedCount} matches within the next 6 months.`);
    } catch (err) {
      console.error('Failed to sync matches', err);
    }
  }
}
