import { Component , inject} from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavItem } from '../../models/navitem.model';
import { SupabaseService } from '../../services';



@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  private supabaseService = inject(SupabaseService);
  private router = inject(Router);
  navItems: NavItem[] = [
    { label: 'Dashboard', route: '/dashboard', icon: '📊' },
    { label: 'Tickets', route: '/dashboard/tickets', icon: '🎫' }
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



