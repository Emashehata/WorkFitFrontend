export interface SidebarMenuItem {
  title: string;
  icon: string;
  route: string;
  roles?: string[];
  children?: SidebarMenuItem[];
  badge?: string;
  isActive?: boolean;
}

export interface SidebarSection {
  title?: string;
  items: SidebarMenuItem[];
}
