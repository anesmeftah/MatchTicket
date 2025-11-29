import { Component } from '@angular/core';
import { Sidebar } from '../../components/sidebar/sidebar';
import { TopbarComponent } from '../../components/topbar/topbar';

@Component({
  selector: 'app-matches',
  imports: [Sidebar , TopbarComponent],
  templateUrl: './matches.html',
  styleUrl: './matches.css',
})
export class Matches {

}
