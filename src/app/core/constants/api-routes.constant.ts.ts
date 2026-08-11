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
payments: {
  process: '/payments',
  byId: (paymentId: string) => `/payments/${paymentId}`,
  checkoutSession: '/payments/checkout-session',
  checkoutSessionCancel: '/payments/checkout-session/cancel',
},
} as const;