import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { SupabaseService } from '../../services/supabase';
import { Search } from '../../services/search';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './topbar.html',
  styleUrls: ['./topbar.css']
})
export class TopbarComponent implements OnInit {
  currentDate = new Date();
  userProfile: any;
  showNotifications = false;
  showUserMenu = false;
  notificationCount = 0;
  searchForm: FormGroup;

  constructor(
    private supabase: SupabaseService,
    private searchService: Search,
    private fb: FormBuilder
  ) {
    this.searchForm = this.fb.group({
      searchTerm: ['']
    });
  }

  ngOnInit() {
    this.loadUserProfile();
    this.updateTime();
    this.setupSearchSubscription();
  }

  setupSearchSubscription() {
    this.searchForm.get('searchTerm')?.valueChanges.subscribe(value => {
      this.searchService.setSearchTerm(value);
    });
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
    }, 60000);
  }


  refreshData() {
    window.location.reload();
  }

  onSearchSubmit() {
    const searchTerm = this.searchForm.get('searchTerm')?.value;
    this.searchService.setSearchTerm(searchTerm);
  }
  
}