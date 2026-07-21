import { Injectable, signal, computed } from '@angular/core';
import { SidebarMenuItem, SidebarSection } from '../../models/sidebar.models';

@Injectable({
  providedIn: 'root',
})
export class SidebarService {
  // ⭐ All menu sections - can be updated dynamically
  private menuSectionsSignal = signal<SidebarSection[]>([
    {
      title: 'Main',
      items: [
        { title: 'Dashboard', icon: 'fa-solid fa-house', route: '/home' },
        { title: 'Employees', icon: 'fa-solid fa-users', route: '/employees' },
        {
          title: 'Projects',
          icon: 'fa-solid fa-diagram-project',
          route: '/projects',
        },
      ],
    },
    {
      title: 'Management',
      items: [
        {
          title: 'Organizations',
          icon: 'fa-solid fa-building',
          route: '/organizations',
        },
        { title: 'Roles', icon: 'fa-solid fa-user-shield', route: '/roles' },
        {
          title: 'Settings',
          icon: 'fa-solid fa-gear',
          route: '/organization_settings',
        },
      ],
    },
  ]);

  readonly menuSections = this.menuSectionsSignal.asReadonly();

  // ⭐ Computed: flattened list for easier navigation
  readonly allMenuItems = computed(() => {
    const items: SidebarMenuItem[] = [];
    this.menuSectionsSignal().forEach((section) => {
      items.push(...section.items);
    });
    return items;
  });

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
    this.menuSectionsSignal.set([
      {
        title: 'Main',
        items: [
          { title: 'Dashboard', icon: 'fa-solid fa-house', route: '/home' },
          {
            title: 'Employees',
            icon: 'fa-solid fa-users',
            route: '/employees',
          },
          {
            title: 'Projects',
            icon: 'fa-solid fa-diagram-project',
            route: '/projects',
          },
        ],
      },
      {
        title: 'Management',
        items: [
          {
            title: 'Organizations',
            icon: 'fa-solid fa-building',
            route: '/organizations',
          },
          { title: 'Roles', icon: 'fa-solid fa-user-shield', route: '/roles' },
          {
            title: 'Settings',
            icon: 'fa-solid fa-gear',
            route: '/organization_settings',
          },
        ],
      },
    ]);
  }
}
