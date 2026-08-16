export interface CodeReviewIssue {
  title: string;
  severity: string;
  detail: string;
  recommendation: string;
  file: string;
  reviewer: string;
}

export interface CodeReviewResponse {
  repository: string;
  commit: string;
  overallScore: number;
  risk: string;
  technicalDebt: string;
  scores: Record<string, number>;
  positiveFindings: string[];
  issues: CodeReviewIssue[];
  recommendations: string[];
  nextActions: string[];
}

export interface CodeReview {
  executionId: string;
  response: CodeReviewResponse;
  executiveSummary: string;
  developerSummary: string;
  hasReviewableFiles: boolean;
  truncated: boolean;
}

export interface SkillGainChange {
  skillId: string;
  skillName: string;
  oldScore: number;
  newScore: number;
  reasoning: string;
}

export interface NewSkillGain {
  skillName: string;
  newScore: number;
  reasoning: string;
}

export interface SkillGainAnalysis {
  skillChanges: SkillGainChange[];
  newSkills: NewSkillGain[];
}

export interface TaskCompleteWithCodeReviewResponse {
  taskId: string;
  codeReview: CodeReview;
  skillGainAnalysis: SkillGainAnalysis;
  assessmentId: string;
}