import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavItem } from '../../models/navitem.model';



@Component({
  selector: 'app-sidebar2',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar2.html',
  styleUrl: './sidebar2.css',
})
export class Sidebar2 {
  navItems: NavItem[] = [
    { label: 'Subscription', route: '/subscription', icon: '📊' },
    { label: 'Tickets', route: '/tickets', icon: '🎫' }
  ];

  constructor(private router: Router) {}
}
