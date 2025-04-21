import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface NotificationSettings {
  email: boolean;
  push: boolean;
}

interface UserProfile {
  name: string;
  email: string;
  avatar: string;
}

@Component({
  standalone: true,
  selector: 'app-settings',
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
})
export class SettingsComponent implements OnInit, OnDestroy {
  currentTheme: 'light' | 'dark' | 'system' = 'system';
  notificationSettings: NotificationSettings = {
    email: false,
    push: true
  };
  userProfile: UserProfile = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: 'assets/images/avatar-placeholder.png'
  };
  isSaving = false;
  showSuccessMessage = false;
  private mediaQuery: MediaQueryList | null = null;
  private mediaQueryListener: ((e: MediaQueryListEvent) => void) | null = null;

  constructor() { }

  ngOnInit() {
    // Get saved theme preference from localStorage
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null;
    if (savedTheme) {
      this.currentTheme = savedTheme;
    }

    // Initialize media query for dark mode
    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this.mediaQueryListener = (e: MediaQueryListEvent) => {
      if (this.currentTheme === 'system') {
        this.updateThemeClass(e.matches);
      }
    };

    // Add event listener
    this.mediaQuery.addEventListener('change', this.mediaQueryListener);

    // Apply initial theme
    this.applyTheme(this.currentTheme);

    // Load notification settings from localStorage
    const savedNotifications = localStorage.getItem('notificationSettings');
    if (savedNotifications) {
      this.notificationSettings = JSON.parse(savedNotifications);
    }

    // Simulate loading user profile from server
    setTimeout(() => {
      console.log('User profile loaded');
    }, 500);
  }

  ngOnDestroy() {
    // Clean up event listener to prevent memory leaks
    if (this.mediaQuery && this.mediaQueryListener) {
      this.mediaQuery.removeEventListener('change', this.mediaQueryListener);
    }
  }

  setTheme(theme: 'light' | 'dark' | 'system') {
    this.currentTheme = theme;
    localStorage.setItem('theme', theme);
    this.applyTheme(theme);

    console.log(`Theme set to: ${theme}`);
  }

  applyTheme(theme: 'light' | 'dark' | 'system') {
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.updateThemeClass(prefersDark);
      console.log(`System theme detected: ${prefersDark ? 'dark' : 'light'}`);
    } else {
      this.updateThemeClass(theme === 'dark');
    }
  }

  updateThemeClass(isDark: boolean) {
    const html = document.documentElement;

    if (isDark) {
      html.classList.add('dark');
      console.log('Dark mode class added');
    } else {
      html.classList.remove('dark');
      console.log('Dark mode class removed');
    }
  }

  saveNotificationSettings() {
    this.isSaving = true;

    // Simulate API call
    setTimeout(() => {
      localStorage.setItem('notificationSettings', JSON.stringify(this.notificationSettings));
      this.isSaving = false;
      this.showSuccessToast();
    }, 800);
  }

  showSuccessToast() {
    this.showSuccessMessage = true;
    setTimeout(() => {
      this.showSuccessMessage = false;
    }, 3000);
  }

  editProfile() {
    // Implement navigation to profile editor or show modal
    console.log('Edit profile clicked');
    alert('Edit profile functionality would open here');
  }

  changePassword() {
    // Implement password change logic
    console.log('Change password clicked');
    alert('Change password form would open here');
  }

  setupTwoFactor() {
    // Implement 2FA setup
    console.log('Setup 2FA clicked');
    alert('Two-factor authentication setup would start here');
  }

  // Toggle notification settings
  toggleEmailNotifications(event: Event) {
    const checkbox = event.target as HTMLInputElement;
    this.notificationSettings.email = checkbox.checked;
  }

  togglePushNotifications(event: Event) {
    const checkbox = event.target as HTMLInputElement;
    this.notificationSettings.push = checkbox.checked;
  }
}
