export type DocumentType = 'DNI' | 'CE' | 'Passport';

export const DOCUMENT_TYPES = {
  DNI: 'DNI',
  CE: 'CE',
  PASSPORT: 'Passport',
} as const satisfies Record<string, DocumentType>;
