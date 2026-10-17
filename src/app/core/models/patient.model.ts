import { DocumentType } from './document-type.model';
import { User } from './user.model';

export interface Patient {
  id: number;
  documentType: DocumentType;
  documentNumber: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phoneNumber: string;
  address: string;
  user: User;
}

export interface CreatePatientRequest {
  username: string;
  email: string;
  password: string;
  documentType: DocumentType;
  documentNumber: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phoneNumber: string;
  address: string;
}
