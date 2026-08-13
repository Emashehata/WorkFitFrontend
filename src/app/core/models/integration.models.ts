export interface JiraSettingsResponse {
  organizationId: string;
  provider: string;
  baseUrl: string;
  email: string;
  projectKey: string;
  pageSize: number;
  updatedAt: string;
}

export interface UpsertJiraSettingsRequest {
  baseUrl: string;
  email: string;
  apiToken: string;
  projectKey: string;
  pageSize?: number;
}

export interface SyncResult {
  providerName: string;
  projectsSynced: number;
  tasksSynced: number;
  developersSynced: number;
  skillsSynced: number;
  errorCount: number;
  errors: string[];
  syncedAt: string;
}
