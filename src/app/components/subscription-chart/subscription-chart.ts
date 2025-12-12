import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../services/supabase';
import { ChartData } from '../../models/chartdata.model';

@Component({
  selector: 'app-subscription-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './subscription-chart.html',
  styleUrl: './subscription-chart.css',
})
export class SubscriptionChart implements OnInit {

  private supabase = inject(SupabaseService);

  subscriptionsByPlan = signal<ChartData[]>([]);
  subscriptionsByTeam = signal<ChartData[]>([]);
  totalSubscriptions = signal(0);
  totalRevenue = signal(0);

  async ngOnInit() {
    await this.loadSubscriptionsByPlan();
    await this.loadSubscriptionsByTeam();
  }

  async loadSubscriptionsByPlan() {
    const { data } = await this.supabase.getClient()
      .from('Abonnement')
      .select('plan_name, price');

    const planCounts = new Map<string, number>();
    let revenue = 0;

    data?.forEach((sub: any) => {
      const plan = sub.plan_name || 'Unknown';
      planCounts.set(plan, (planCounts.get(plan) || 0) + 1);

      if (sub.price) {
        revenue += Number(sub.price);
      }
    });

    const chartData: ChartData[] = [];
    planCounts.forEach((count, plan) => {
      chartData.push({ label: plan, value: count });
    });

    this.subscriptionsByPlan.set(chartData);
    this.totalSubscriptions.set(data?.length || 0);
    this.totalRevenue.set(revenue);
  }

  async loadSubscriptionsByTeam() {
    const { data } = await this.supabase.getClient()
      .from('Abonnement')
      .select('equipe');

    const teamCounts = new Map<string, number>();

    data?.forEach((sub: any) => {
      const team = sub.equipe || 'No Team';
      teamCounts.set(team, (teamCounts.get(team) || 0) + 1);
    });

    const chartData: ChartData[] = [];
    teamCounts.forEach((count, team) => {
      chartData.push({ label: team, value: count });
    });

    this.subscriptionsByTeam.set(chartData);
  }

  // ==== Chart Helpers ====

  getSegmentPath(data: ChartData[], index: number): string {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    if (total === 0) return '';

    let startAngle = 0;
    for (let i = 0; i < index; i++) {
      startAngle += (data[i].value / total) * 360;
    }

    const angle = (data[index].value / total) * 360;
    const endAngle = startAngle + angle;

    const startRad = (startAngle - 90) * Math.PI / 180;
    const endRad = (endAngle - 90) * Math.PI / 180;

    const x1 = 50 + 40 * Math.cos(startRad);
    const y1 = 50 + 40 * Math.sin(startRad);
    const x2 = 50 + 40 * Math.cos(endRad);
    const y2 = 50 + 40 * Math.sin(endRad);

    const largeArc = angle > 180 ? 1 : 0;

    return `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`;
  }

  getPercentage(data: ChartData[], value: number): string {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    return total === 0 ? '0%' : ((value / total) * 100).toFixed(1) + '%';
  }

  getMaxValue(data: ChartData[]): number {
    return Math.max(...data.map(item => item.value), 1);
  }

  getBarWidth(value: number, max: number): number {
    return (value / max) * 100;
  }
}
