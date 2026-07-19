export interface Project {

  id: string;

  name: string;

  departmentId: string;

  status: string;

  startDate: string | null;

  endDate: string | null;

  memberCount: number;

  taskCount: number;

}