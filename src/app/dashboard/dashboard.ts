import { Component } from '@angular/core';
import { Sidebar } from '../components/sidebar/sidebar';
import { StatisticsCards } from '../components/statistics-cards/statistics-cards';
import { TicketsTable } from '../components/tickets-table/tickets-table';
import { Topbar } from '../components/topbar/topbar';
import { MatchesTable } from '../components/matchs-table/matches-table';

@Component({
  selector: 'app-dashboard',
  imports: [Sidebar , StatisticsCards , TicketsTable , Topbar, MatchesTable],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {

}
