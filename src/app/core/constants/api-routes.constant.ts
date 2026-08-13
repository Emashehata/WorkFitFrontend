export const API_ROUTES = {
  identity: {
    login: '/identity/login',
  },
  workflow: {
    registerOrganization: '/workflow/organization/register',
  },
  organizations: {
    me: '/organizations/me',
    meSettings: '/organizations/me/settings',
  },
  employees: {
    list: '/employees',
    byId: (id: string) => `/employees/${id}`,
  },
  projects: {
    list: '/projects',
    byId: (id: string) => `/projects/${id}`,
    update: (id: string) => `/projects/${id}`,
    teamLead: '/projects/teamLead',
    status: (id: string) => `/projects/${id}/status`,
    archive: (id: string) => `/projects/${id}/archive`,
    tasks: (id: string) => `/projects/${id}/tasks`,
  },
  tasks: {
    byId: (id: string) => `/tasks/${id}`,
    update: (id: string) => `/tasks/${id}`,
    assign: (id: string) => `/tasks/${id}/assign`,
    complete: (id: string) => `/tasks/${id}/complete`,
    delete: (id: string) => `/tasks/${id}`,
    allocation: (id: string) => `/tasks/${id}/allocation`,
    github: (id: string) => `/tasks/${id}/github`,
  },
  talent: {
    employees: '/employees',
    employeeById: (id: string) => `/talent-management/employees/${id}`,
  },
  skills: {
    list: '/skills',
  },
  integration: {
    jiraSettings: (orgId: string) => `/integration/${orgId}/jira-settings`,
    sync: '/integration/sync',
  },
} as const;
