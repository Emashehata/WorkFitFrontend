export interface CreateDeveloperInvitationRequest {
  projectId: string;
  employeeProfileId: string;
  sourceAccountId: string;
  email?: string;
}

export interface InvitationDto {
  id: string;
  organizationId: string;
  projectId: string;
  employeeProfileId: string;
  email: string;
  displayName: string;
  sourceAccountId: string;
  status: string;
  requestedAt: string;
  deliveryState: string;
}

export interface ReviewInvitationResponse {
  invitation: InvitationDto;
  developmentInvitationUrl?: string | null;
}

export interface InvitationTokenInfo {
  displayName: string;
  email: string;
  expiresAt: string;
}

export interface AcceptInvitationRequest {
  token: string;
  displayName: string;
  password: string;
}

export interface AcceptInvitationResponse {
  userId: string;
  employeeProfileId: string;
  projectId: string;
}
