import { Component, inject, output, computed, signal, DestroyRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../../core/services/auth/auth.service';

export interface BreadcrumbItem {
  label: string;
  url: string;
  isLast: boolean;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private location = inject(Location);
  private destroyRef = inject(DestroyRef);

  toggleSidebar = output<void>();

  currentUser = this.authService.currentUser;
  breadcrumbs = signal<BreadcrumbItem[]>([]);

  userName = computed(() => {
    const user = this.currentUser();
    return user?.displayName || user?.email?.split('@')[0] || 'User';
  });

  userRole = computed(() => {
    const user = this.currentUser();
    return user?.roles?.[0] || 'Member';
  });

  userInitials = computed(() => {
    const name = this.userName();
    return name ? name.charAt(0).toUpperCase() : 'U';
  });

  constructor() {
    this.updateBreadcrumbs(this.router.url);
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(e => {
      this.updateBreadcrumbs(e.urlAfterRedirects);
    });
  }

  goBack(): void {
    this.location.back();
  }

  goForward(): void {
    this.location.forward();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  private updateBreadcrumbs(url: string): void {
    const cleanUrl = url.split('?')[0].split('#')[0];
    const pathSegments = cleanUrl.split('/').filter(s => s.length > 0);

    const items: BreadcrumbItem[] = [];

    if (pathSegments.length === 0 || pathSegments[0] === 'home') {
      this.breadcrumbs.set([]);
      return;
    }

    let accumulatedUrl = '';
    for (let i = 0; i < pathSegments.length; i++) {
      const seg = pathSegments[i];
      accumulatedUrl += `/${seg}`;

      let label = seg;
      if (seg.match(/^[0-9a-f-]{36}$/i)) {
        label = 'Details';
      } else if (seg === 'organization_settings') {
        label = 'Organization Settings';
      } else if (seg === 'invitation-approvals') {
        label = 'Invitation Approvals';
      } else if (seg === 'payment-success') {
        label = 'Payment Success';
      } else {
        label = seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' ');
      }

      items.push({
        label,
        url: accumulatedUrl,
        isLast: i === pathSegments.length - 1
      });
    }

    this.breadcrumbs.set(items);
  }
}
