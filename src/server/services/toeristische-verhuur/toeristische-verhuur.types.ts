import type { BBVergunningFrontend } from './bed-and-breakfast/bed-and-breakfast-types.ts';
import type { caseTypeToeristischeVerhuur } from '../../../client/pages/Thema/ToeristischeVerhuur/ToeristischeVerhuur-thema-config.ts';
import type { DecosZaakBase } from '../decos/decos-types.ts';
import type {
  DecosZaakFrontend,
  WithLocation,
  WithDateRange,
} from '../decos/decos-types.ts';

type CaseTypeToeristischeVerhuurKey = keyof typeof caseTypeToeristischeVerhuur;

export type GetCaseType<T extends CaseTypeToeristischeVerhuurKey> =
  (typeof caseTypeToeristischeVerhuur)[T];

export type DecosVakantieverhuurVergunningaanvraag = DecosZaakBase &
  WithLocation &
  WithDateRange & {
    caseType: GetCaseType<'VakantieverhuurVergunningaanvraag'>;
    title: 'Vergunning vakantieverhuur';
    decision: 'Verleend' | 'Ingetrokken';
  };

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

export type VakantieverhuurVergunningFrontend =
  DecosZaakFrontend<DecosVakantieverhuurVergunningaanvraag>;

export type ToeristischeVerhuurVergunning =
  | BBVergunningFrontend
  | VakantieverhuurVergunningFrontend;

type s1 = BBVergunningFrontend['steps'];
type s2 = VakantieverhuurVergunningFrontend['steps'];

export type ToeristischeVerhuur = {
  vakantieverhuurVergunningen: VakantieverhuurVergunningFrontend[];
  bbVergunningen: BBVergunningFrontend[];
  lvvRegistraties: LVVRegistratie[];
};
