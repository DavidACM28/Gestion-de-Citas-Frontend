export type AppointmentStatus =
  | 'REQUESTED'
  | 'CONFIRMED'
  | 'BEING_ATTENDED'
  | 'FINISHED'
  | 'CANCELED'
  | 'DID_NOT_ATTEND';

export const APPOINTMENT_STATUS = {
  REQUESTED: 'REQUESTED',
  CONFIRMED: 'CONFIRMED',
  BEING_ATTENDED: 'BEING_ATTENDED',
  FINISHED: 'FINISHED',
  CANCELED: 'CANCELED',
  DID_NOT_ATTEND: 'DID_NOT_ATTEND',
} as const satisfies Record<string, AppointmentStatus>;
