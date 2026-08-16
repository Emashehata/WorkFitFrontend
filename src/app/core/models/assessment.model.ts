export interface SkillChange {
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
  taskName?: string;
  status?: 'Pending' | 'Approved' | 'Rejected';
  skillChanges: SkillChange[];
}

export interface AlterSkillChange {
  skillId: string; // ⚠️ بدل skillChangeId - الـ response بقى بيرجّع skillId بس
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