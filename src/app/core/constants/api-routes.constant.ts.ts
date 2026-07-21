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
  },
} as const;