export type WeekDay =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday';

export interface WeekDayOption {
  value: WeekDay;
  label: string;
}

export const WEEK_DAYS: WeekDayOption[] = [
  { value: 'Monday', label: 'Lunes' },
  { value: 'Tuesday', label: 'Martes' },
  { value: 'Wednesday', label: 'Miércoles' },
  { value: 'Thursday', label: 'Jueves' },
  { value: 'Friday', label: 'Viernes' },
  { value: 'Saturday', label: 'Sábado' },
  { value: 'Sunday', label: 'Domingo' }
];

export const APPOINTMENT_DURATIONS = [15, 30, 45, 60] as const;

export interface BusinessHours {
  id: number;
  dayOfWeek: WeekDay;
  startTime: string;
  endTime: string;
  appointmentDurationMin: number;
  doctorName: string;
  specialtyName: string;
  specialtyDescription: string;
}

export interface CreateBusinessHoursRequest {
  doctorId: number;
  dayOfWeek: WeekDay;
  startTime: string;
  endTime: string;
  appointmentDurationMin: number;
}

export type UpdateBusinessHoursRequest = Omit<CreateBusinessHoursRequest, 'doctorId'>;
