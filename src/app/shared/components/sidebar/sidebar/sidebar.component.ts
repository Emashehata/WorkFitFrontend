import { Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface MenuItem {
  title: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent {

  // بيتحكم فيه الـ Layout
  opened = input(true);

  // للموبايل
  close = output<void>();

  menu: MenuItem[] = [
    {
      title: 'Dashboard',
      icon: 'fa-solid fa-house',
      route: '/home'
    },
    {
      title: 'Employees',
      icon: 'fa-solid fa-users',
      route: '/employees'
    },
    {
      title: 'Projects',
      icon: 'fa-solid fa-diagram-project',
      route: '/projects'
    },
    {
      title: 'Organizations',
      icon: 'fa-solid fa-building',
      route: '/organizations'
    },
    {
      title: 'Roles',
      icon: 'fa-solid fa-user-shield',
      route: '/roles'
    },
    {
      title: 'Settings',
      icon: 'fa-solid fa-gear',
      route: '/oganization_settings'
    }
  ];

}