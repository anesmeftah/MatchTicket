import { Component, Input } from '@angular/core';
import { MatchStat } from '../../models/matchstats.model';

@Component({
  selector: 'app-histogram',
  standalone: true,
  imports: [],
  templateUrl: './app-histogram.html',
  styleUrl: './app-histogram.css',
})
export class AppHistogram {
  // Input data from parent component
  @Input() data: MatchStat[] = [];

  // Calculate bar height as percentage
  getBarHeight(count: number): number {
    const max = Math.max(...this.data.map(s => s.count), 1);
    return (count / max) * 100;
  }
}

