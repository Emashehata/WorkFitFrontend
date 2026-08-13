export interface SkillChange {
  skillChangeId: string;
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
  taskId: string;
  taskName?: string;
  status?: 'Pending' | 'Approved' | 'Rejected';
  skillChanges: SkillChange[];
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