import { DecosZaakBase, DecosZaakFrontend } from '../decos/decos-types';

export const caseTypeVaren = {
  VarenRederRegistratie: 'Varen registratie reder',
  VarenVergunningExploitatie: 'Varen vergunning exploitatie',
  VarenVergunningExploitatieWijzigingVergunningshouder:
    'Varen vergunning exploitatie Wijziging vergunninghouder',
  VarenVergunningExploitatieWijzigingVervanging:
    'Varen vergunning exploitatie Wijziging vervanging',
  VarenVergunningExploitatieWijzigingVerbouwing:
    'Varen vergunning exploitatie Wijziging verbouwing',
  VarenVergunningExploitatieWijzigingVaartuignaam:
    'Varen vergunning exploitatie Wijziging vaartuignaam',
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

export type VarenVergunningExploitatieWijzigingVaartuigNaamType =
  DecosZaakBase & {
    caseType: GetCaseType<'VarenVergunningExploitatieWijzigingVaartuignaam'>;
    vesselNameOld: string | null;
  } & Pick<VarenVergunningExploitatieType, 'vesselName'>;

export type VarenVergunningExploitatieWijzigingVergunningshouderType =
  DecosZaakBase & {
    caseType: GetCaseType<'VarenVergunningExploitatieWijzigingVergunningshouder'>;
    statutoryName: string | null;
    businessAddress: string | null;
    correspondenceAddress: string | null;
  } & Pick<VarenVergunningExploitatieType, 'segment'>;

export type VarenVergunningExploitatieWijzigingVerbouwingType =
  DecosZaakBase & {
    caseType: GetCaseType<'VarenVergunningExploitatieWijzigingVerbouwing'>;
  } & Pick<
      VarenVergunningExploitatieType,
      | 'vesselName'
      | 'segment'
      | 'formAppearance'
      | 'numberOfSeats'
      | 'vesselDepth'
      | 'vesselHeight'
      | 'vesselLength'
      | 'vesselWidth'
    >;

export type VarenVergunningExploitatieWijzigingVervangingType =
  DecosZaakBase & {
    caseType: GetCaseType<'VarenVergunningExploitatieWijzigingVervanging'>;
    vesselNameOld: string | null;
    vesselName: string | null;
  } & Pick<
      VarenVergunningExploitatieType,
      | 'vesselName'
      | 'segment'
      | 'formAppearance'
      | 'numberOfSeats'
      | 'vesselDepth'
      | 'vesselHeight'
      | 'vesselLength'
      | 'vesselWidth'
      | 'eniNumber'
    >;

export type VarenVergunningLigplaatsType = DecosZaakBase & {
  caseType: GetCaseType<'VarenVergunningLigplaats'>;
  decision: 'Geannuleerd' | 'Afgehandeld';
  location: string | null;
  vesselName: string | null;
};

export type Varen =
  | VarenRegistratieRederType
  | VarenVergunningExploitatieType
  | VarenVergunningLigplaatsType
  | VarenVergunningExploitatieWijzigingVaartuigNaamType
  | VarenVergunningExploitatieWijzigingVerbouwingType
  | VarenVergunningExploitatieWijzigingVergunningshouderType
  | VarenVergunningExploitatieWijzigingVervangingType;

export type VarenFrontend<T extends DecosZaakBase = Varen> =
  DecosZaakFrontend<T>;

export type VarenVergunningFrontend = Exclude<
  VarenFrontend,
  VarenRegistratieRederType
>;
