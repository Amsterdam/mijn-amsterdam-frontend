import { ZaakDetail } from '../../../universal/types';
import { DecosZaakBase } from '../decos/decos-types';

export const caseTypeVaren = {
  VarenRederRegistratie: 'Varen registratie reder',
  VarenVergunningExploitatie: 'Varen vergunning exploitatie',
  VarenVergunningLigplaats: 'Varen ligplaatsvergunning',
} as const;
export type CaseTypeVaren = keyof typeof caseTypeVaren;
export type GetCaseType<T extends CaseTypeVaren> = (typeof caseTypeVaren)[T];

export type VarenRegistratieRederType = DecosZaakBase & {
  caseType: GetCaseType<'VarenRederRegistratie'>;
  title: 'Varen registratie reder';
  decision: 'Verleend' | 'Ingetrokken';
  company: string | null;
  bsnkvk: string | null;
  adres: string | null;
  postal: string | null;
  city: string | null;
  phone: string | null;
  email: string | null;
};

export interface VarenVergunningExploitatieType extends DecosZaakBase {
  caseType: GetCaseType<'VarenVergunningExploitatie'>;
  title: 'Varen vergunning exploitatie';
  decision:
    | 'Nog niet bekend'
    | 'Afgewezen'
    | 'Afgewezen door loting'
    | 'Buiten behandeling'
    | 'Ingetrokken door aanvaarder'
    | 'Verleend';
  status:
    | 'Ontvangen'
    | 'In behandeling'
    | 'Aanvullende informatie gevraagd'
    | 'Nadere informatie nodig'
    | 'Besluit';
  formAppearance: 1 | 2 | 3;
  segment:
    | 'Beeldbepalend groot'
    | 'Beeldbepalend klein en middelgroot'
    | 'Groot'
    | 'Historisch groot'
    | 'Historisch klein en middelgroot'
    | 'Klein en middelgroot'
    | 'Onbemand';
  isCvoIssued: boolean;
  numberOfSeats: number | null; // 001 seats
  boatHeight: number | null; // 0.01 meters
  boatDepth: number | null; // 0.01 meters
  boatWidth: number | null; // 0.01 meters
  boatLength: number | null; // 0.01 meters
  boatName: string | null;
}

export interface VarenVergunningLigplaatsType extends DecosZaakBase {
  caseType: GetCaseType<'VarenVergunningLigplaats'>;
  title: 'Varen ligplaatsvergunning';
  decision: 'Geannuleerd' | 'Afgehandeld';
  location: string | null;
  boatName: string | null;
}

export type Varen =
  | VarenRegistratieRederType
  | VarenVergunningExploitatieType
  | VarenVergunningLigplaatsType;

export type VarenFrontend<T extends Varen = Varen> = T & {
  dateDecisionFormatted?: string | null;
  dateInBehandeling: string | null;
  dateInBehandelingFormatted: string | null;
  dateRequestFormatted: string;
  dateStartFormatted?: string | null;
  dateEndFormatted?: string | null;
  isExpired?: boolean;
} & ZaakDetail;
