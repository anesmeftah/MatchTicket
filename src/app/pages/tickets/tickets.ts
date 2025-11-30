import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Sidebar } from '../../components/sidebar/sidebar';
import { TopbarComponent } from '../../components/topbar/topbar';
import { MatchService } from '../../services/match';

@Component({
  selector: 'app-tickets',
  imports: [Sidebar , TopbarComponent, CommonModule],
  templateUrl: './tickets.html',
  styleUrl: './tickets.css',
})
export class Tickets {
  private matchService = inject(MatchService);
  
  upcomingMatches = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTime = today.getTime();
    
    return this.matchService.matches()
      .filter(match => {
        const matchDate = new Date(match.date);
        matchDate.setHours(0, 0, 0, 0);
        return matchDate.getTime() >= todayTime;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  });

}
