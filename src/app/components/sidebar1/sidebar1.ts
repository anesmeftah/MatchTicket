import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavItem } from '../../models/navitem.model';



@Component({
  selector: 'app-sidebar1',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar1.html',
  styleUrl: './sidebar1.css',
})
export class Sidebar1 {
  navItems: NavItem[] = [
    { label: 'Profile', route: '/profile', icon: '📊' },
    { label: 'Tickets', route: '/tickets', icon: '🎫' }
  ];

  constructor(private router: Router) {}
}
