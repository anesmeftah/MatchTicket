import { Component, inject, signal, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
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
  // Inject the services we need
  private supabaseService = inject(SupabaseService);
  private platformId = inject(PLATFORM_ID);

  // Data for our charts (using signals for reactivity)
  subscriptionsByPlan = signal<ChartData[]>([]);
  subscriptionsByTeam = signal<ChartData[]>([]);
  totalSubscriptions = signal<number>(0);
  totalRevenue = signal<number>(0);

  // Load data when component starts
  async ngOnInit() {
    // Only run in browser (not during server-side rendering)
    if (isPlatformBrowser(this.platformId)) {
      await this.loadSubscriptionData();
    }
  }

  // Main function to load all subscription data
  async loadSubscriptionData() {
    // Load both charts at the same time
    await Promise.all([
      this.loadSubscriptionsByPlan(),
      this.loadSubscriptionsByTeam()
    ]);
  }

  // Load subscriptions grouped by plan name
  async loadSubscriptionsByPlan() {
    // Get all subscriptions from the Abonnement table
    const { data, error } = await this.supabaseService.getClient()
      .from('Abonnement')
      .select('plan_name, price');

    // If there's an error or no data, stop here
    if (error || !data) {
      console.error('Error loading subscriptions by plan:', error);
      return;
    }

    // Count subscriptions for each plan and calculate revenue
    const planCounts = new Map<string, number>();
    let revenue = 0;

    data.forEach((subscription: any) => {
      // Get the plan name (or 'Unknown' if not set)
      const plan = subscription.plan_name || 'Unknown';
      // Add 1 to the count for this plan
      planCounts.set(plan, (planCounts.get(plan) || 0) + 1);
      // Add the price to total revenue
      if (subscription.price) {
        revenue += Number(subscription.price);
      }
    });

    // Convert the Map to an array for our chart
    const chartData: ChartData[] = [];
    planCounts.forEach((count, plan) => {
      chartData.push({
        label: plan,
        value: count,
      });
    });

    // Sort by count (highest first)
    chartData.sort((a, b) => b.value - a.value);

    // Update our signals with the new data
    this.subscriptionsByPlan.set(chartData);
    this.totalSubscriptions.set(data.length);
    this.totalRevenue.set(revenue);
  }

  // Load subscriptions grouped by team
  async loadSubscriptionsByTeam() {
    // Get all subscriptions with their team
    const { data, error } = await this.supabaseService.getClient()
      .from('Abonnement')
      .select('equipe');

    if (error || !data) {
      console.error('Error loading subscriptions by team:', error);
      return;
    }

    // Count subscriptions for each team
    const teamCounts = new Map<string, number>();

    data.forEach((subscription: any) => {
      const team = subscription.equipe || 'No Team';
      teamCounts.set(team, (teamCounts.get(team) || 0) + 1);
    });

    // Convert to array for our chart
    const chartData: ChartData[] = [];
    teamCounts.forEach((count, team) => {
      chartData.push({
        label: team,
        value: count,
      });
    });

    // Sort and take top 6 teams
    chartData.sort((a, b) => b.value - a.value);
    this.subscriptionsByTeam.set(chartData.slice(0, 6));
  }

  // ===== HELPER FUNCTIONS FOR DRAWING CHARTS =====

  // Calculate the path for a pie chart segment
  getSegmentPath(data: ChartData[], index: number): string {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    if (total === 0) return '';

    // Calculate where this segment starts (after previous segments)
    let startAngle = 0;
    for (let i = 0; i < index; i++) {
      startAngle += (data[i].value / total) * 360;
    }

    // Calculate how big this segment is
    const angle = (data[index].value / total) * 360;
    const endAngle = startAngle + angle;

    // Convert to radians and calculate coordinates
    const startRad = (startAngle - 90) * (Math.PI / 180);
    const endRad = (endAngle - 90) * (Math.PI / 180);

    const x1 = 50 + 40 * Math.cos(startRad);
    const y1 = 50 + 40 * Math.sin(startRad);
    const x2 = 50 + 40 * Math.cos(endRad);
    const y2 = 50 + 40 * Math.sin(endRad);

    const largeArc = angle > 180 ? 1 : 0;

    // Return SVG path command
    return `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`;
  }

  // Calculate percentage for display
  getPercentage(data: ChartData[], value: number): string {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    if (total === 0) return '0%';
    return ((value / total) * 100).toFixed(1) + '%';
  }

  // Get the maximum value in the data (for scaling bars)
  getMaxValue(data: ChartData[]): number {
    return Math.max(...data.map(item => item.value), 1);
  }

  // Calculate bar width as percentage
  getBarWidth(value: number, maxValue: number): number {
    return (value / maxValue) * 100;
  }
}
