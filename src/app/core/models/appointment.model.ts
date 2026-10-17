import { AppointmentStatus } from './appointment-status.model';

export interface Appointment {
  id: number;
  doctorId: number;
  patientId: number;
  patientName: string;
  patientFirstName: string;
  patientLastName: string;
  date: string;
  startTime: string;
  durationMin: number;
  status: AppointmentStatus;
  reason: string;
  note?: string | null;
}

export interface AppointmentListRequest {
  doctorId?: number;
  patientId?: number;
  specialtyId?: number;
  startDate?: string;
  endDate?: string;
  status?: AppointmentStatus | '';
  pageNumber: number;
  pageSize: number;
}

export interface CreateAppointmentRequest {
  doctorId: number;
  patientId: number;
  date: string;
  startTime: string;
  reason: string;
  note: string;
}

export type UpdateAppointmentRequest = CreateAppointmentRequest;

export type AppointmentTransition =
  | 'confirm'
  | 'start'
  | 'finish'
  | 'did-not-attend'
  | 'cancel';
