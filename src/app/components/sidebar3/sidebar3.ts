import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavItem } from '../../models/navitem.model';
import { SupabaseService } from '../../services/supabase';

@Component({
  selector: 'app-sidebar3',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar3.html',
  styleUrl: './sidebar3.css',
})
export class Sidebar3 {
  private supabaseService = inject(SupabaseService);
  private router = inject(Router);
  
  navItems: NavItem[] = [
    { label: 'Profile', route: '/profile', icon: '👤' },
    { label: 'Tickets', route: '/ticket', icon: '🎫' },
    { label: 'Subscription', route: '/subscription', icon: '📋' }
  ];
  async disconnect() {
    try {
      // Get the currently connected user
      const connectedUserId = await this.supabaseService.getConnectedUserId();
      
      if (connectedUserId) {
        // Sign out the user (set isconnected = 0)
        const result = await this.supabaseService.signOutUser(connectedUserId);
        
        if (result.success) {
          console.log('✅ User disconnected successfully');
          this.router.navigate(['/auth']);
        } else {
          console.error('❌ Failed to disconnect:', result.error);
          alert('Failed to disconnect. Please try again.');
        }
      } else {
        console.warn('⚠️ No connected user found');
        this.router.navigate(['/auth']);
      }
    } catch (error) {
      console.error('❌ Error during disconnect:', error);
      alert('An error occurred during disconnect.');
    }
  }
}

