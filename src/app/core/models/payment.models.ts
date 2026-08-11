// ⭐ Checkout Session Request - MATCH SWAGGER
export interface CheckoutSessionRequest {
  referenceId: string;      // Organization ID
  referenceType: string;    // e.g., "Subscription"
  amount: number;           // e.g., 999.99
  currency: string;         // e.g., "usd" or "egp"
  description: string;      // e.g., "Pro Plan - monthly"
}

export interface CheckoutSessionResponse {
  paymentId: string;
  referenceId: string;
  referenceType: string;
  amount: number;
  currency: string;
  status: string;
  provider: string;
  providerPaymentId?: string;
  transactionId?: string;
  clientSecret?: string;
  createdAt: string;
  updatedAt: string;
  checkoutSessionId: string;
  checkoutUrl: string;
}

// ⭐ Payment Response (from GET /api/payments/{paymentId})
export interface PaymentResponse {
  id: string;
  referenceId: string;
  referenceType: string;
  amount: number;
  currency: string;
  status: 'Success' | 'Failed' | 'Pending' | 'Processing' | 'Cancelled' | 'Refunded';
  provider: string;
  providerPaymentId?: string;
  transactionId?: string;
  clientSecret?: string;
  createdAt: string;
  updatedAt: string;
}
export interface PaymentRequest {
  referenceId: string;
  referenceType: string;
  amount: number;
  currency: string;
  description: string;
  mockOutcome?: 'Success' | 'Failed' | 'Pending';
}




export interface CancelCheckoutSessionRequest {
  referenceId: string;
  referenceType: string;
}
// ⭐ ==================== PAYMENT STATUS ====================

export interface PaymentStatus {
  isPaid: boolean;
  hasActiveSubscription: boolean;
  subscriptionPlan?: 'Free' | 'Basic' | 'Pro' | 'Enterprise';
  subscriptionStatus?: 'Active' | 'Expired' | 'Cancelled' | 'Trial';
  trialEndDate?: string;
  nextBillingDate?: string;
  features: {
    maxEmployees: number;
    maxProjects: number;
    maxTeams: number;
    hasAdvancedAnalytics: boolean;
    hasAIAssessments: boolean;
    hasCustomBranding: boolean;
    hasAPIAccess: boolean;
  };
}

export interface PaymentStatusResponse {
  status: PaymentStatus;
  message?: string;
}

// ⭐ ==================== FEATURE FLAGS ====================

export const FREE_TIER: PaymentStatus['features'] = {
  maxEmployees: 5,
  maxProjects: 2,
  maxTeams: 1,
  hasAdvancedAnalytics: false,
  hasAIAssessments: false,
  hasCustomBranding: false,
  hasAPIAccess: false,
};

export const BASIC_TIER: PaymentStatus['features'] = {
  maxEmployees: 25,
  maxProjects: 10,
  maxTeams: 5,
  hasAdvancedAnalytics: false,
  hasAIAssessments: true,
  hasCustomBranding: false,
  hasAPIAccess: false,
};

export const PRO_TIER: PaymentStatus['features'] = {
  maxEmployees: 100,
  maxProjects: 50,
  maxTeams: 20,
  hasAdvancedAnalytics: true,
  hasAIAssessments: true,
  hasCustomBranding: true,
  hasAPIAccess: true,
};

export const ENTERPRISE_TIER: PaymentStatus['features'] = {
  maxEmployees: 9999,
  maxProjects: 9999,
  maxTeams: 9999,
  hasAdvancedAnalytics: true,
  hasAIAssessments: true,
  hasCustomBranding: true,
  hasAPIAccess: true,
};