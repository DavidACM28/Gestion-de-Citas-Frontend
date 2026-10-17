export interface AppointmentBlock {
  id: number;
  doctorId: number;
  date: string;
  startTime: string;
  endTime: string;
  reason: string;
}

export interface AppointmentBlockListRequest {
  doctorId?: number;
  startDate?: string;
  endDate?: string;
}

export interface CreateAppointmentBlockRequest {
  doctorId: number;
  date: string;
  startTime: string;
  endTime: string;
  reason: string;
  force: boolean;
}
