export const API_ROUTES = {
  AUTH: {
    LOGIN: '/api/auth/login',
  },
  USERS: {
    BASE: '/api/users',
    BY_ID: (id: number) => `/api/users/${id}`,
    ME: '/api/users/me',
  },
  SPECIALTIES: {
    BASE: '/api/specialties',
    BY_ID: (id: number) => `/api/specialties/${id}`,
  },
  DOCTORS: {
    BASE: '/api/doctors',
    BY_ID: (id: number) => `/api/doctors/${id}`,
    ME: '/api/doctors/me',
    MY_APPOINTMENTS: '/api/doctors/me/appointments',
    BUSINESS_HOURS: (doctorId: number) => `/api/doctors/${doctorId}/business-hours`,
  },
  PATIENTS: {
    BASE: '/api/patients',
    BY_ID: (id: number) => `/api/patients/${id}`,
    ME: '/api/patients/me',
  },
  BUSINESS_HOURS: {
    BASE: '/api/businessHours',
    BY_ID: (id: number) => `/api/businessHours/${id}`,
  },
  APPOINTMENTS: {
    BASE: '/api/appointments',
    BY_ID: (id: number) => `/api/appointments/${id}`,
    CONFIRM: (id: number) => `/api/appointments/${id}/confirm`,
    START: (id: number) => `/api/appointments/${id}/start`,
    FINISH: (id: number) => `/api/appointments/${id}/finish`,
    DID_NOT_ATTEND: (id: number) => `/api/appointments/${id}/did-not-attend`,
    CANCEL: (id: number) => `/api/appointments/${id}/cancel`,
  },
  APPOINTMENT_BLOCKS: {
    BASE: '/api/appointmentBlocks',
    BY_ID: (id: number) => `/api/appointmentBlocks/${id}`,
  },
} as const;
