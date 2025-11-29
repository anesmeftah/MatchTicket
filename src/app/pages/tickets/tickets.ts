import { Component } from '@angular/core';
import { Sidebar } from '../../components/sidebar/sidebar';
import { TopbarComponent } from '../../components/topbar/topbar';
import { StatisticsCards } from '../../components/statistics-cards/statistics-cards';

@Component({
  selector: 'app-tickets',
  imports: [Sidebar , TopbarComponent],
  templateUrl: './tickets.html',
  styleUrl: './tickets.css',
})
export class Tickets {

}
