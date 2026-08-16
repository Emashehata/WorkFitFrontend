export interface EmployeeSkillSummary {
  Id: string;
  SkillId: string;
  SkillName: string;
  ConfidenceScore: number;
}

export interface IdentityMapping {
  Provider: string;
  ExternalId: string;
}

export interface Certification {
  Id: string;
  Name: string;
  IssuedAt: string | null;
}

export interface EmployeeProfile {
  Id: string;
  OrganizationId: string;
  UserId: string;
  Name: string;
  Email: string;
  JobTitle: string;
  Bio: string | null;
  LinkedInUrl: string | null;
  Status: string;
  IsActive: boolean;
  CurrentAllocationPercentage: number;
  HireDate: string | null;
  CreatedAt: string;
  UpdatedAt: string;
  Skills: EmployeeSkillSummary[];
  IdentityMappings: IdentityMapping[];
  Certifications: Certification[];
}

export interface EmployeeListItem {
  Id: string;
  Name: string;
  Email: string;
  JobTitle: string;
  IsActive: boolean;
  CurrentAllocationPercentage: number;
}

export interface ConfidenceChange {
  id: string;
  assessmentId: string;
  oldScore: number;
  newScore: number;
  createdAt: string;
}

export interface EmployeeSkillDetail {
  employeeSkillId: string;
  employeeProfileId: string;
  skillId: string;
  skillName: string;
  confidenceScore: number;
  confidenceChanges: ConfidenceChange[];
}

export interface LinkGitHubRequest {
  gitHubAccountId: string;
  gitHubDisplayName: string;
}