import { Specialty } from './specialty.model';
import { User } from './user.model';

export interface Doctor {
  id: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  user: User;
  specialty: Specialty;
}

export interface DoctorListRequest {
  specialty?: string;
  name?: string;
  pageNumber: number;
  pageSize: number;
}
