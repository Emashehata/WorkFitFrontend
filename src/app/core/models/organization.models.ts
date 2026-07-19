export interface Organization {
  id: string;
  name: string;
  userId: string;
  brandingJson: string;
  settingsJson: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface OrganizationSettings {
  id: string;
  settingsJson: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface UpdateOrganizationRequest {
  name?: string;
  brandingJson?: string;
  settingsJson?: string;
}

export interface OrganizationSettingsUpdate {
  settingsJson?: string;
}