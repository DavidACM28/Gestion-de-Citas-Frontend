import { Role } from './auth.model';

export type AdministrativeRole = Extract<Role, 'Admin' | 'Receptionist'>;

export interface User {
  id: number;
  username: string;
  email: string;
  role: Role;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  role: AdministrativeRole;
}
