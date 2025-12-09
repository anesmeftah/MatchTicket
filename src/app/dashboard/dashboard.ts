import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Sidebar } from '../components/sidebar/sidebar';
import { StatisticsCards } from '../components/statistics-cards/statistics-cards';
import { TicketsTable } from '../components/tickets-table/tickets-table';
import { TopbarComponent } from '../components/topbar/topbar';
import { MatchesTable } from '../components/matchs-table/matches-table';
import { DashboardChart } from '../components/dashboard-chart/dashboard-chart';
import { AppHistogram } from '../components/app-histogram/app-histogram';
import { SupabaseService } from '../services/supabase';
import { MatchStat } from '../models/matchstats.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    Sidebar, 
    TopbarComponent,
    StatisticsCards, 
    AppHistogram,
    DashboardChart,
    TicketsTable, 
    MatchesTable
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  // Which view to show: 0 = histogram, 1 = dashboard chart
  currentView = signal<number>(0);
  
  // Data for the histogram
  matchStats = signal<MatchStat[]>([]);

  constructor(private supabaseService: SupabaseService) {}

  // Load data when component starts
  async ngOnInit() {
    const stats = await this.supabaseService.getTicketsSoldPerMatch();
    this.matchStats.set(stats);
  }

  // Go to next view
  nextView() {
    this.currentView.set(this.currentView() === 0 ? 1 : 0);
  }

  // Go to previous view
  prevView() {
    this.currentView.set(this.currentView() === 0 ? 1 : 0);
  }
}
