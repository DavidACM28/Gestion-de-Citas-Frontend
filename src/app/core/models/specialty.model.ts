export interface Specialty {
  id: number;
  name: string;
  description: string;
}

export interface CreateSpecialtyRequest {
  name: string;
  description: string;
}
