import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavItem } from '../../models/navitem.model';

@Component({
  selector: 'app-sidebar3',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar3.html',
  styleUrl: './sidebar3.css',
})
export class Sidebar3 {
  navItems: NavItem[] = [
    { label: 'Profile', route: '/profile', icon: '👤' },
    { label: 'Tickets', route: '/ticket', icon: '🎫' },
    { label: 'Subscription', route: '/subscription', icon: '📋' }
  ];

  constructor(private router: Router) {}
}
