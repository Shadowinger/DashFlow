import { CommonModule } from '@angular/common';
import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ChartsComponent } from "../../components/charts/charts.component";
import { UserTableComponent } from "../../components/user-table/user-table.component";
import { isPlatformBrowser } from '@angular/common';

interface Person {
  id: number;
  name: string;
  email: string;
  role: string;
  department: string;
  tasks: number;
  avatar: string;
}

interface LeaderboardEntry {
  id: number;
  name: string;
  points: number;
  position: number;
  avatar: string;
  trend: 'up' | 'down' | 'same';
}

interface Project {
  id: number;
  name: string;
  status: string;
  progress: number;
  team: number[];
  deadline: string;
  tasks: {
    total: number;
    completed: number;
  };
}

interface Organization {
  id: number;
  name: string;
  industry: string;
  employees: number;
  projects: number;
  logo: string;
}

@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [CommonModule, HttpClientModule, ChartsComponent, UserTableComponent],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  people: Person[] = [];
  leaderboard: LeaderboardEntry[] = [];
  projects: Project[] = [];
  organizations: Organization[] = [];
  isLoading = true;
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    if (this.isBrowser) {
      this.loadDashboardData();
    } else {
      this.isLoading = false;
    }
  }

  loadDashboardData() {
    this.http.get<any>('assets/data.json').subscribe({
      next: (data) => {
        this.people = data.people || [];
        this.leaderboard = data.leaderboard || [];
        this.projects = data.projects || [];
        this.organizations = data.organizations || [];
        this.isLoading = false;
        console.log('Dashboard data loaded successfully');
      },
      error: (err) => {
        console.error('Error loading dashboard data:', err);
        this.isLoading = false;
      }
    });
  }

  navigateToSettings() {
    this.router.navigate(['/settings']);
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100';
      case 'planning':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100';
      case 'completed':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100';
      default:
        return 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100';
    }
  }

  getTrendIcon(trend: string): string {
    switch (trend) {
      case 'up':
        return 'M5 10l7-7m0 0l7 7m-7-7v18';
      case 'down':
        return 'M19 14l-7 7m0 0l-7-7m7 7V3';
      default:
        return 'M5 12h14';
    }
  }

  getTrendClass(trend: string): string {
    switch (trend) {
      case 'up':
        return 'text-green-500';
      case 'down':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  }
}
