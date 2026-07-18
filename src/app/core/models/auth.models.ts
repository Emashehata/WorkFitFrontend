
export interface LoginRequest {
  email: string;
  password: string;
 
  twoFactorCode?: string;
  twoFactorRecoveryCode?: string;
}


export type LoginResponse = string;

export interface RegisterOrganizationRequest {
  email: string;
  password: string;
  confirmPassword: string;
  organizationName: string;
}


export type RegisterOrganizationResponse = string;

export interface DecodedToken {
  sub: string;
  unique_name: string;
  email: string;
  name: string;
  role?: string | string[];
  exp: number;
  iss: string;
  aud: string;
}

export interface CurrentUser {
  userId: string;
  email: string;
  displayName: string;
  roles: string[];
}
