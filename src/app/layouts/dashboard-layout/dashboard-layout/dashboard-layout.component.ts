import {
  Component,
  HostListener,
  signal
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar/sidebar.component';
import { HeaderComponent } from '../../../shared/components/header/header/header.component';
 

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    SidebarComponent,
    HeaderComponent
  ],
  templateUrl: './dashboard-layout.component.html',
})
export class DashboardLayoutComponent {

  sidebarOpen = signal(true);

  isMobile = signal(window.innerWidth < 992);

  constructor() {
    if (this.isMobile()) {
      this.sidebarOpen.set(false);
    }
  }

  @HostListener('window:resize')
  onResize() {
    const mobile = window.innerWidth < 992;

    this.isMobile.set(mobile);

    if (mobile) {
      this.sidebarOpen.set(false);
    } else {
      this.sidebarOpen.set(true);
    }
  }

  toggleSidebar() {
    this.sidebarOpen.update(value => !value);
  }

  closeSidebar() {
    if (this.isMobile()) {
      this.sidebarOpen.set(false);
    }
  }

}