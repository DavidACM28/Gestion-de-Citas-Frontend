export type Role = 'Admin' | 'Receptionist' | 'Doctor' | 'Patient';

export const ROLES = {
  ADMIN: 'Admin',
  RECEPTIONIST: 'Receptionist',
  DOCTOR: 'Doctor',
  PATIENT: 'Patient',
} as const satisfies Record<string, Role>;
