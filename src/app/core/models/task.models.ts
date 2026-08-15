import { TaskStatus } from '../enums/task-status.enum';
import { TaskPriority } from '../enums/task-priority.enum';
import { TaskType } from '../enums/task-type.enum';

export interface TaskListItem {
  id: string;
  projectId?: string;
  title: string;
  taskType: TaskType;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string | null;
  storyPoints: number | null;
  dueDate: string | null;
  completedAt: string | null;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  taskType?: TaskType;
  priority?: TaskPriority;
  assigneeId?: string;
  storyPoints?: number;
  dueDate?: string;
  allocationPercentage: number;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
  storyPoints?: number;
}

export interface EmployeeListItemDto {
  id: string;
  name: string;
  email: string;
  jobTitle: string;
  isActive: boolean;
  currentAllocationPercentage: number;
}

export interface EmployeeDetailsDto {
  employeeId: string;
  organizationId: string;
  userId: string;
  name: string;
  email: string;
  jobTitle: string;
  bio: string | null;
  linkedInUrl: string | null;
  status: string;
  currentAllocationPercentage: number;
  skills: { id: string; skillId: string; skillName: string; confidenceScore: number }[];
}

export interface AssignTaskRequest {
  projectId: string;
  assigneeId: string;
  allocationPercentage?: number;
}

export interface SetTaskAllocationRequest {
  allocationPercentage: number;
}

export interface SetTaskGitHubRequest {
  githubRepositoryId?: number;
  githubRepositoryName?: string;
  githubBranchName?: string;
  githubPullRequestNumber?: number;
}

export interface TaskDetailDto {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  taskType: TaskType;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string | null;
  createdById: string;
  storyPoints: number | null;
  allocationPercentage: number | null;
  dueDate: string | null;
  sourceSystem: string | null;
  sourceReferenceId: string | null;
  completedAt: string | null;
  createdAt: string;
  isActive: boolean;
}
