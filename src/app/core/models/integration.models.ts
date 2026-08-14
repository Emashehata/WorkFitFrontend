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
  skillSignalsSynced: number;
  errors: number;
  errorMessages: string[];
  syncedAt: string;
  unknownDevelopers: UnknownDeveloper[];
}

export interface UnknownDeveloper {
  employeeProfileId: string;
  projectId: string;
  sourceAccountId: string;
  displayName: string;
  email: string | null;
  issueCount: number;
  invitationStatus: string;
}
