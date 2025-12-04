import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../services/supabase';
import { Search } from '../../services/search';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './topbar.html',
  styleUrls: ['./topbar.css']
})
export class TopbarComponent implements OnInit {
  currentDate = new Date();
  userProfile: any;
  showNotifications = false;
  showUserMenu = false;
  notificationCount = 0;

  constructor(
    private supabase: SupabaseService,
    private searchService: Search
  ) {}

  ngOnInit() {
    this.loadUserProfile();
    this.updateTime();
  }

  async loadUserProfile() {
    const session = this.supabase.session;
    if (session?.user) {
      const { data } = await this.supabase.profile(session.user);
      this.userProfile = data;
    }
  }

  updateTime() {
    setInterval(() => {
      this.currentDate = new Date();
    }, 60000); // Update every minute
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
  }

  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
  }

  async handleSignOut() {
    await this.supabase.signOut();
  }

  refreshData() {
    window.location.reload();
  }

  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchService.setSearchTerm(input.value);
  }
  
}