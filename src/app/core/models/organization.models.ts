export interface Organization {
  id: string;
  name: string;
  userId: string;
  brandingJson: string;
  settingsJson: string;
  gitHubOrganizationId: number | null;
  gitHubOrganizationLogin: string | null;
  gitHubCreatedAt: string | null;
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

export interface GitHubStatusResponse {
  organizationId: string;
  gitHubOrganizationId: number | null;
  gitHubOrganizationLogin: string | null;
  gitHubCreatedAt: string | null;
}


export interface GitHubConnectionRequest {
  userId: string;
  gitHubOrganizationId: number;
  gitHubOrganizationLogin: string;
}


export interface GitHubOrgLookupResponse {
  login: string;
  id: number;
  html_url: string;
  avatar_url: string;
  description: string | null;
  type: string;
}
