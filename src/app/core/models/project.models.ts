export interface Project {
  id: string;
  name: string;
  description: string | null;
  organizationId: string;
  status: string;
  startDate: string | null;
  endDate: string | null;
  memberCount: number;
  taskCount: number;
}

export interface ProjectDetail {
  id: string;
  name: string;
  description: string | null;
  organizationId: string;
  status: string;
  teamLeaderId: string | null;
  startDate: string | null;
  endDate: string | null;
  requiredSkills: RequiredSkillDto[];
  sourceSystem: string | null;
  sourceReferenceId: string | null;
  createdAt: string;
  coveragePct: number;
}

export interface ProjectMember {
  id: string;
  name: string;
  email: string | null;
  jobTitle: string;
  isActive: boolean;
  currentAllocationPercentage: number;
}

export interface RequiredSkillDto {
  skillId: string;
  skillName: string;
  level: string;
  priority: number;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  attatchedDocumentIds: string[];
  orgnaizationId: string;
  teamLeaderId: string;
  startDate: string;
  endDate: string;
  status?: string;
  requiredSkills?: { skillId: string; level: string; priority: number }[];
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  endDate?: string;
  requiredSkills?: { skillId: string; level: string; priority: number }[];
}

export interface ProjectUpdatedDto {
  id: string;
  name: string;
  status: string;
}

export const PROJECT_STATUSES = ['Planning', 'Active', 'OnHold', 'Completed', 'Cancelled'] as const;
export type ProjectStatusValue = (typeof PROJECT_STATUSES)[number];

/**
 * Converts a PascalCase status (list endpoint) or snake_case status
 * (detail/update endpoints) into the canonical PascalCase form used for display.
 */
export function normalizeProjectStatus(status: string | null | undefined): string {
  if (!status) return '';

  const map: Record<string, string> = {
    planning: 'Planning',
    active: 'Active',
    on_hold: 'OnHold',
    onhold: 'OnHold',
    completed: 'Completed',
    cancelled: 'Cancelled',
  };

  return map[status.toLowerCase()] ?? status;
}

/** Converts a display status (e.g. "OnHold") into the snake_case wire format. */
export function toApiProjectStatus(status: string): string {
  return status.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
}
