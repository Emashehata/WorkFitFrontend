import { Injectable, signal, computed, inject } from '@angular/core';
import { SidebarMenuItem, SidebarSection } from '../../models/sidebar.models';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class SidebarService {
  private authService = inject(AuthService);
  isCollapsed = signal<boolean>(false);

  toggleCollapse(): void {
    this.isCollapsed.update(value => !value);
  }
  // ⭐ All menu sections - can be updated dynamically
  private menuSectionsSignal = signal<SidebarSection[]>([]);

  readonly menuSections = this.menuSectionsSignal.asReadonly();

  // ⭐ Computed: flattened list for easier navigation
  readonly allMenuItems = computed(() => {
    const items: SidebarMenuItem[] = [];
    this.menuSectionsSignal().forEach((section) => {
      items.push(...section.items);
    });
    return items;
  });

  constructor() {
    // ⭐ Initialize menu on service creation
    this.initializeMenu();
  }

  /**
   * Initialize menu based on user roles
   */
  initializeMenu(): void {
  const user = this.authService.currentUser();
  const roles = user?.roles || [];

  const sections: SidebarSection[] = [];

  const mainItems: SidebarMenuItem[] = [
    { title: 'Dashboard', icon: 'fa-solid fa-house', route: '/home' },
  ];

  if (roles.some(role => ['SuperAdmin', 'Admin', 'OrganizationOwner', 'TeamLeader'].includes(role))) {
    mainItems.push({
      title: 'Employees',
      icon: 'fa-solid fa-users',
      route: '/employees',
    });
  }

  mainItems.push({
    title: 'Projects',
    icon: 'fa-solid fa-diagram-project',
    route: '/projects',
  });

  // ⬇️ Profile — متاح للكل
  mainItems.push({
    title: 'My Profile',
    icon: 'fa-solid fa-id-card',
    route: '/profile',
  });

  // ⬇️ Assessments — حسب الدور
  if (roles.includes('TeamLeader')) {
    mainItems.push({
      title: 'Team Assessments',
      icon: 'fa-solid fa-clipboard-check',
      route: '/team-assessments',
    });
  }

  if (roles.includes('Employee')) {
    mainItems.push({
      title: 'My Assessments',
      icon: 'fa-solid fa-clipboard-check',
      route: '/my-assessments',
    });
  }

  sections.push({
    title: 'Main',
    items: mainItems,
  });

  const managementItems: SidebarMenuItem[] = [];

  if (roles.some(r => r === 'OrganizationOwner' || r === 'SuperAdmin')) {
    managementItems.push({
      title: 'Organizations',
      icon: 'fa-solid fa-building',
      route: '/organizations',
    });
    managementItems.push({
      title: 'Settings',
      icon: 'fa-solid fa-gear',
      route: '/organization_settings',
    });
    managementItems.push({
      title: 'Invitation Approvals',
      icon: 'fa-solid fa-user-check',
      route: '/invitation-approvals',
    });
    managementItems.push({
      title: 'GitHub Integration',
      icon: 'fa-brands fa-github',
      route: '/integrations',
      badge: 'New',
    });
  }

  if (roles.includes('SuperAdmin')) {
    managementItems.push({
      title: 'Roles',
      icon: 'fa-solid fa-user-shield',
      route: '/roles',
    });
  }

  if (managementItems.length > 0) {
    sections.push({
      title: 'Management',
      items: managementItems,
    });
  }

  this.menuSectionsSignal.set(sections);
}

  // ⭐ Set full menu
  setMenuSections(sections: SidebarSection[]): void {
    this.menuSectionsSignal.set(sections);
  }

  // ⭐ Add a section
  addSection(section: SidebarSection): void {
    this.menuSectionsSignal.update((current) => [...current, section]);
  }

  // ⭐ Add item to a specific section
  addItemToSection(sectionTitle: string, item: SidebarMenuItem): void {
    this.menuSectionsSignal.update((current) => {
      return current.map((section) => {
        if (section.title === sectionTitle) {
          return { ...section, items: [...section.items, item] };
        }
        return section;
      });
    });
  }

  // ⭐ Remove item by route
  removeItemByRoute(route: string): void {
    this.menuSectionsSignal.update((current) => {
      return current.map((section) => ({
        ...section,
        items: section.items.filter((item) => item.route !== route),
      }));
    });
  }

  // ⭐ Update menu based on user roles (filter items)
  filterMenuByRoles(userRoles: string[]): void {
    this.menuSectionsSignal.update((current) => {
      return current
        .map((section) => ({
          ...section,
          items: section.items.filter((item) => {
            if (!item.roles) return true;
            return item.roles.some((role) => userRoles.includes(role));
          }),
        }))
        .filter((section) => section.items.length > 0);
    });
  }

  // ⭐ Reset to default
  resetMenu(): void {
    this.initializeMenu();
  }
}
