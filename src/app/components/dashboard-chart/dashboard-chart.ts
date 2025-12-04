import { Component, inject, signal, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { SupabaseService } from '../../services/supabase';
import { MatchService } from '../../services/match';

interface ChartData {
  label: string;
  value: number;
  color: string;
}

@Component({
  selector: 'app-dashboard-chart',
  imports: [CommonModule],
  templateUrl: './dashboard-chart.html',
  styleUrl: './dashboard-chart.css',
})
export class DashboardChart implements OnInit {
  private supabaseService = inject(SupabaseService);
  private matchService = inject(MatchService);
  private platformId = inject(PLATFORM_ID);

  protected readonly ticketsByStatus = signal<ChartData[]>([]);
  protected readonly revenueByMonth = signal<ChartData[]>([]);
  protected readonly matchesByCompetition = signal<ChartData[]>([]);
  protected readonly totalTickets = signal<number>(0);

  private readonly colors = [
    '#4A70A9', '#6B8FC7', '#8FADE5', '#A8C4F0', '#C5DBFA',
    '#2E5A88', '#1E4A78', '#0E3A68', '#003058', '#002048'
  ];

  async ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      await this.loadChartData();
    }
  }

  async loadChartData() {
    await Promise.all([
      this.loadTicketsByStatus(),
      this.loadRevenueByMonth(),
      this.loadMatchesByCompetition()
    ]);
  }

  async loadTicketsByStatus() {
    const { data, error } = await this.supabaseService.getClient()
      .from('tickets')
      .select('status');

    if (error || !data) return;

    const statusCounts = new Map<string, number>();
    data.forEach((ticket: any) => {
      const status = ticket.status || 'unknown';
      statusCounts.set(status, (statusCounts.get(status) || 0) + 1);
    });

    const chartData: ChartData[] = [];
    let colorIndex = 0;
    statusCounts.forEach((count, status) => {
      chartData.push({
        label: status.charAt(0).toUpperCase() + status.slice(1),
        value: count,
        color: this.colors[colorIndex % this.colors.length]
      });
      colorIndex++;
    });

    this.ticketsByStatus.set(chartData);
    this.totalTickets.set(data.length);
  }

  async loadRevenueByMonth() {
    const { data, error } = await this.supabaseService.getClient()
      .from('tickets')
      .select('price, date, status')
      .eq('status', 'sold');

    if (error || !data) return;

    const monthlyRevenue = new Map<string, number>();
    data.forEach((ticket: any) => {
      if (ticket.date && ticket.price) {
        const date = new Date(ticket.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthName = date.toLocaleString('default', { month: 'short', year: '2-digit' });
        monthlyRevenue.set(monthName, (monthlyRevenue.get(monthName) || 0) + ticket.price);
      }
    });

    const chartData: ChartData[] = [];
    let colorIndex = 0;
    monthlyRevenue.forEach((revenue, month) => {
      chartData.push({
        label: month,
        value: revenue,
        color: this.colors[colorIndex % this.colors.length]
      });
      colorIndex++;
    });

    this.revenueByMonth.set(chartData.slice(-6)); // Last 6 months
  }

  async loadMatchesByCompetition() {
    const { data, error } = await this.supabaseService.getClient()
      .from('matches')
      .select('competition');

    if (error || !data) return;

    const competitionCounts = new Map<string, number>();
    data.forEach((match: any) => {
      const competition = match.competition || 'Other';
      competitionCounts.set(competition, (competitionCounts.get(competition) || 0) + 1);
    });

    const chartData: ChartData[] = [];
    let colorIndex = 0;
    competitionCounts.forEach((count, competition) => {
      chartData.push({
        label: competition,
        value: count,
        color: this.colors[colorIndex % this.colors.length]
      });
      colorIndex++;
    });

    // Sort by count and take top 6
    chartData.sort((a, b) => b.value - a.value);
    this.matchesByCompetition.set(chartData.slice(0, 6));
  }

  // Calculate pie chart segment
  getSegmentPath(data: ChartData[], index: number): string {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    if (total === 0) return '';

    let startAngle = 0;
    for (let i = 0; i < index; i++) {
      startAngle += (data[i].value / total) * 360;
    }
    const angle = (data[index].value / total) * 360;
    const endAngle = startAngle + angle;

    const startRad = (startAngle - 90) * (Math.PI / 180);
    const endRad = (endAngle - 90) * (Math.PI / 180);

    const x1 = 50 + 40 * Math.cos(startRad);
    const y1 = 50 + 40 * Math.sin(startRad);
    const x2 = 50 + 40 * Math.cos(endRad);
    const y2 = 50 + 40 * Math.sin(endRad);

    const largeArc = angle > 180 ? 1 : 0;

    return `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`;
  }

  getPercentage(data: ChartData[], value: number): string {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    if (total === 0) return '0%';
    return ((value / total) * 100).toFixed(1) + '%';
  }

  getMaxValue(data: ChartData[]): number {
    return Math.max(...data.map(d => d.value), 1);
  }

  getBarHeight(value: number, maxValue: number): number {
    return (value / maxValue) * 100;
  }
}
