export const API_ROUTES = {
  identity: {
    login: '/identity/login',
  },
  workflow: {
    registerOrganization: '/workflow/organization/register',
    cvsUpload: '/workflow/cvs/upload',
  },
  organizations: {
    me: '/organizations/me',
    meSettings: '/organizations/me/settings',
    meGithub: '/organizations/me/github',
    meId: '/organizations/me/id',
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
    members: (id: string) => `/projects/${id}/members`,
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
  developerInvitations: {
    create: '/developer-invitations',
    pending: '/developer-invitations/pending',
    review: (id: string) => `/developer-invitations/${id}/review`,
    token: (token: string) => `/developer-invitations/token/${encodeURIComponent(token)}`,
    accept: '/developer-invitations/accept',
  },
  payments: {
    process: '/payments',
    byId: (paymentId: string) => `/payments/${paymentId}`,
    checkoutSession: '/payments/checkout-session',
    checkoutSessionCancel: '/payments/checkout-session/cancel',
  },
} as const;
