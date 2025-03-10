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

export type VarenStatus =
  | 'Ontvangen'
  | 'In behandeling'
  | 'Meer informatie nodig'
  | 'Besluit';

type DecosVarenZaakBase = DecosZaakBase & {
  linkDataRequest: string | null;
  status: VarenStatus;
};

export type VarenRegistratieRederType = DecosVarenZaakBase & {
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

export type VarenVergunningExploitatieType = DecosVarenZaakBase & {
  caseType: GetCaseType<'VarenVergunningExploitatie'>;
  decision:
    | 'Nog niet bekend'
    | 'Afgewezen'
    | 'Afgewezen door loting'
    | 'Buiten behandeling'
    | 'Ingetrokken door aanvrager'
    | 'Verleend';
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
  DecosVarenZaakBase & {
    caseType: GetCaseType<'VarenVergunningExploitatieWijzigingVaartuignaam'>;
    vesselNameOld: string | null;
  } & Pick<VarenVergunningExploitatieType, 'vesselName' | 'permitReference'>;

export type VarenVergunningExploitatieWijzigingVergunningshouderType =
  DecosVarenZaakBase & {
    caseType: GetCaseType<'VarenVergunningExploitatieWijzigingVergunningshouder'>;
    statutoryName: string | null;
    businessAddress: string | null;
    correspondenceAddress: string | null;
  } & Pick<VarenVergunningExploitatieType, 'segment' | 'permitReference'>;

export type VarenVergunningExploitatieWijzigingVerbouwingType =
  DecosVarenZaakBase & {
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
      | 'permitReference'
    >;

export type VarenVergunningExploitatieWijzigingVervangingType =
  DecosVarenZaakBase & {
    caseType: GetCaseType<'VarenVergunningExploitatieWijzigingVervanging'>;
    vesselNameOld: string | null;
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
      | 'permitReference'
    >;

export type VarenVergunningLigplaatsType = DecosVarenZaakBase & {
  caseType: GetCaseType<'VarenVergunningLigplaats'>;
  decision: 'Geannuleerd' | 'Afgehandeld';
  location: string | null;
} & Pick<VarenVergunningExploitatieType, 'vesselName'>;

export type Varen =
  | VarenRegistratieRederType
  | VarenVergunningExploitatieType
  | VarenVergunningLigplaatsType
  | VarenVergunningExploitatieWijzigingVaartuigNaamType
  | VarenVergunningExploitatieWijzigingVerbouwingType
  | VarenVergunningExploitatieWijzigingVergunningshouderType
  | VarenVergunningExploitatieWijzigingVervangingType;

export type VarenFrontend<T extends DecosVarenZaakBase = Varen> =
  DecosZaakFrontend<T>;

export type VarenVergunningFrontend = Exclude<
  VarenFrontend,
  VarenRegistratieRederType
>;
