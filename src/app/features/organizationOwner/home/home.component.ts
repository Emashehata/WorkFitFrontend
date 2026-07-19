// features/home/home.component.ts
import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth/auth.service';
import { CurrentUser } from '../../../core/models/auth.models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  userName = signal<string>('User');
  userEmail = signal<string>('');
  userRoles = signal<string[]>([]);
  organizationName = signal<string>('Your Organization');
  currentDate = signal<string>('');
  currentTime = signal<string>('');

  // Dashboard statistics
  stats = signal([
    {
      label: 'Total Employees',
      value: '0',
      icon: 'users',
      color: 'from-blue-500 to-blue-600',
    },
    {
      label: 'Active Projects',
      value: '0',
      icon: 'projects',
      color: 'from-purple-500 to-purple-600',
    },
    {
      label: 'Pending Tasks',
      value: '0',
      icon: 'tasks',
      color: 'from-orange-500 to-orange-600',
    },
    {
      label: 'Completion Rate',
      value: '0%',
      icon: 'chart',
      color: 'from-green-500 to-green-600',
    },
  ]);

  // Recent activities
  recentActivities = signal([
    {
      user: 'John Doe',
      action: 'completed a task',
      time: '2 min ago',
      type: 'task',
    },
    {
      user: 'Jane Smith',
      action: 'joined the organization',
      time: '15 min ago',
      type: 'user',
    },
    {
      user: 'Mike Johnson',
      action: 'updated the project',
      time: '1 hour ago',
      type: 'project',
    },
    {
      user: 'Sarah Wilson',
      action: 'submitted a report',
      time: '2 hours ago',
      type: 'report',
    },
    {
      user: 'Robert Brown',
      action: 'commented on a task',
      time: '3 hours ago',
      type: 'comment',
    },
  ]);

  // Quick actions
  quickActions = signal([
    {
      label: 'Add Employee',
      icon: 'user-plus',
      color: 'bg-indigo-500',
      route: '/employees/add',
    },
    {
      label: 'Create Project',
      icon: 'folder-plus',
      color: 'bg-purple-500',
      route: '/projects/create',
    },
    {
      label: 'Assign Tasks',
      icon: 'clipboard-list',
      color: 'bg-green-500',
      route: '/tasks/assign',
    },
    {
      label: 'Generate Report',
      icon: 'chart-bar',
      color: 'bg-orange-500',
      route: '/reports/generate',
    },
  ]);

  ngOnInit(): void {
    this.updateDateTime();
    setInterval(() => this.updateDateTime(), 1000);
    this.loadUserData();
  }

  updateDateTime(): void {
    const now = new Date();
    this.currentDate.set(
      now.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    );
    this.currentTime.set(
      now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
    );
  }

  loadUserData(): void {
    // Get user data from auth service
    const user = this.authService.currentUser();
    if (user) {
      // Set user name from displayName or fallback to email
      this.userName.set(
        user.displayName || user.email?.split('@')[0] || 'User',
      );
      this.userEmail.set(user.email || '');
      this.userRoles.set(user.roles || []);

      // You can set organization name from user data if available
      // For now, we'll keep it as a placeholder or derive from email domain
      if (user.email) {
        const domain = user.email.split('@')[1];
        if (domain) {
          const orgName = domain.split('.')[0];
          this.organizationName.set(
            orgName.charAt(0).toUpperCase() + orgName.slice(1),
          );
        }
      }
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }

  getInitials(name: string): string {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  // Get role badge color
  getRoleBadgeColor(role: string): string {
    const roleColors: { [key: string]: string } = {
      Admin: 'bg-red-100 text-red-700',
      Manager: 'bg-purple-100 text-purple-700',
      Employee: 'bg-blue-100 text-blue-700',
      HR: 'bg-pink-100 text-pink-700',
      Developer: 'bg-indigo-100 text-indigo-700',
    };
    return roleColors[role] || 'bg-gray-100 text-gray-700';
  }
}
