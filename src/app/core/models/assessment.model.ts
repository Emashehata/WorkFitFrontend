export enum AssessmentStatus {
  Pending = 0,
  Rejected = 1,
  Approved = 2,
}

export interface SkillChange {
  id: string;
  skillId: string;
  skillName: string;
  oldScore: number;
  proposedScore: number;
  evidence: string;
}

export interface Assessment {
  assessmentId: string;
  employeeId: string;
  employeeName?: string;
  taskId: string | null;
  skillChanges: SkillChange[];
  status: AssessmentStatus;
}

export interface AlterSkillChange {
  skillChangeId: string;
  newScore: number;
  note: string;
}

export interface AlterAssessmentRequest {
  skillChanges: AlterSkillChange[];
  note: string;
}

export interface ApproveRejectRequest {
  note: string;
}
