export type Role = 'Admin' | 'Receptionist' | 'Doctor' | 'Patient';

export interface LoginRequest {
  userName: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  expirationDate: string;
  role: Role;
}

export interface ApiResult<T = unknown> {
  value?: T;
  isSuccess: boolean;
  isFailure: boolean;
  message: string;
  errors?: string[];
}

export interface CurrentUser {
  userName: string;
  role: Role;
  token: string;
  expiresAt: string;
}
