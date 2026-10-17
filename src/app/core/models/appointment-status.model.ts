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

export const APPOINTMENT_STATUS_OPTIONS: Array<{
  value: AppointmentStatus;
  label: string;
}> = [
  { value: APPOINTMENT_STATUS.REQUESTED, label: 'Solicitada' },
  { value: APPOINTMENT_STATUS.CONFIRMED, label: 'Confirmada' },
  { value: APPOINTMENT_STATUS.BEING_ATTENDED, label: 'En atención' },
  { value: APPOINTMENT_STATUS.FINISHED, label: 'Finalizada' },
  { value: APPOINTMENT_STATUS.CANCELED, label: 'Cancelada' },
  { value: APPOINTMENT_STATUS.DID_NOT_ATTEND, label: 'No asistió' }
];

export const APPOINTMENT_STATUS_LABELS = Object.fromEntries(
  APPOINTMENT_STATUS_OPTIONS.map((option) => [option.value, option.label])
) as Record<AppointmentStatus, string>;
