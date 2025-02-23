import { DecosZaakBase, DecosZaakFrontend } from '../decos/decos-types';

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
  address: string | null;
  postalCode: string | null;
  city: string | null;
  phone: string | null;
  email: string | null;
};

export type VarenVergunningExploitatieType = DecosZaakBase & {
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
  // eslint-disable-next-line no-magic-numbers
  formAppearance: 1 | 2 | 3;
  segment:
    | 'Beeldbepalend groot'
    | 'Beeldbepalend klein en middelgroot'
    | 'Groot'
    | 'Historisch groot'
    | 'Historisch klein en middelgroot'
    | 'Klein en middelgroot'
    | 'Onbemand';
  eniNumber: string | null;
  permitReference: string | null;
  numberOfSeats: number | null; // 001 seats
  vesselHeight: number | null; // 0.01 meters
  vesselDepth: number | null; // 0.01 meters
  vesselWidth: number | null; // 0.01 meters
  vesselLength: number | null; // 0.01 meters
  vesselName: string | null;
};

export type VarenVergunningLigplaatsType = DecosZaakBase & {
  caseType: GetCaseType<'VarenVergunningLigplaats'>;
  title: 'Varen ligplaatsvergunning';
  decision: 'Geannuleerd' | 'Afgehandeld';
  location: string | null;
  vesselName: string | null;
};

export type Varen =
  | VarenRegistratieRederType
  | VarenVergunningExploitatieType
  | VarenVergunningLigplaatsType;

export type VarenFrontend<T extends DecosZaakBase = Varen> =
  DecosZaakFrontend<T>;

export type VarenVergunningFrontend = Exclude<
  VarenFrontend,
  VarenRegistratieRederType
>;
