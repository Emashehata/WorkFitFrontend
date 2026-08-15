export interface EmployeeSkillSummary {
  id: string;
  skillId: string;
  skillName: string;
  confidenceScore: number;
}

export interface EmployeeProfile {
  employeeId: string;
  organizationId: string;
  userId: string;
  name: string;
  email: string;
  jobTitle: string;
  bio: string;
  linkedInUrl: string;
  status: string;
  currentAllocationPercentage: number;
  skills: EmployeeSkillSummary[];
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