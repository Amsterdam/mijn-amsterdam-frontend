import { BBVergunning } from './toeristische-verhuuur-powerbrowser-bb-vergunning-types';
import {
  GenericDocument,
  ZaakDetail,
} from '../../../universal/types/App.types';

// LVV Registraties
export interface ToeristischeVerhuurRegistratieNumberSource {
  registrationNumber: string;
}

export interface ToeristischeVerhuurRegistratieHouse {
  city: string;
  houseLetter: string | null;
  houseNumber: string | null;
  houseNumberExtension: string | null;
  postalCode: string | null;
  street: string | null;
}

export interface LVVRegistratieSource {
  rentalHouse: ToeristischeVerhuurRegistratieHouse;
  registrationNumber: string;
  agreementDate: string | null;
}

export interface LVVRegistratie {
  address: string;
  registrationNumber: string;
  agreementDate: string | null;
  agreementDateFormatted: string | null;
}

export interface LVVRegistratiesSourceData {
  content: LVVRegistratie[];
}

// Vakantieverhuur vergunningen (DECOS)
export interface VakantieverhuurVergunning extends ZaakDetail {
  adres: string;
  dateDecision?: string | null;
  dateEnd: string;
  dateEndFormatted: string;
  dateReceived: string;
  dateStart: string;
  dateStartFormatted: string;
  documents: GenericDocument[];
  fetchDocumentsUrl: string | null;
  id: string;
  isActual: boolean;
  result: 'Verleend' | 'Ingetrokken' | null;
  status: string;
  title: 'Vergunning vakantieverhuur';
  zaaknummer: string;
}

export type ToeristischeVerhuurVergunning =
  | BBVergunning
  | VakantieverhuurVergunning;
