import { OmitMapped } from '../../../universal/helpers/utils';
import { ZaakDetail } from '../../../universal/types/App.types';
import { DecosZaakBase } from '../decos/config-and-types';

export type DecosZaakVarensFieldsSource = {
  mark: string;
  subject2: string | null;
  text10: string | null;
  text11: string | null;
  text21: string | null;
  text22: string | null;
  text36: string | null;
};

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

type CaseTypeVarenKey = keyof typeof caseTypeVaren;
export type GetCaseType<T extends CaseTypeVarenKey> = (typeof caseTypeVaren)[T];
export type CaseTypeVaren = GetCaseType<CaseTypeVarenKey>;

export type VarenStatus =
  | 'Ontvangen'
  | 'In behandeling'
  | 'Meer informatie nodig'
  | 'Afgehandeld';

type DecosVarenZaakVergunning = {
  id: string;
  vergunningKenmerk: string | null;
  segment:
    | 'Beeldbepalend groot'
    | 'Beeldbepalend klein en middelgroot'
    | 'Groot'
    | 'Historisch groot'
    | 'Historisch klein en middelgroot'
    | 'Klein en middelgroot'
    | 'Onbemand';
  eniNumber: string | null;
  vesselName: string | null;
  vesselWidth: string | null; // 0.01 meters
  vesselLength: string | null; // 0.01 meters
};
export type DecosVarenZaakBase = DecosZaakBase &
  DecosVarenZaakVergunning & {
    linkDataRequest: string | null;
    status: VarenStatus;
    decision: 'Verleend' | null;
    vergunningKenmerk: string | null;
    vergunningen: DecosVarenZaakVergunning[];
  };

export type VarenVergunningExploitatieType = DecosVarenZaakBase & {
  caseType: GetCaseType<'VarenVergunningExploitatie'>;
};

export type VarenVergunningExploitatieWijzigingVaartuigNaamType =
  DecosVarenZaakBase & {
    caseType: GetCaseType<'VarenVergunningExploitatieWijzigingVaartuignaam'>;
    vesselNameNew: string | null;
  };

export type VarenVergunningExploitatieWijzigingVergunningshouderType =
  DecosVarenZaakBase & {
    caseType: GetCaseType<'VarenVergunningExploitatieWijzigingVergunningshouder'>;
    statutoryName: string | null;
    businessAddress: string | null;
    correspondenceAddress: string | null;
  };

export type VarenVergunningExploitatieWijzigingVerbouwingType =
  DecosVarenZaakBase & {
    caseType: GetCaseType<'VarenVergunningExploitatieWijzigingVerbouwing'>;
  };

export type VarenVergunningExploitatieWijzigingVervangingType =
  DecosVarenZaakBase & {
    caseType: GetCaseType<'VarenVergunningExploitatieWijzigingVervanging'>;
    vesselNameNew: string | null;
  };

export type VarenVergunningLigplaatsType = DecosVarenZaakBase & {
  caseType: GetCaseType<'VarenVergunningLigplaats'>;
  location: string | null;
};

export type VarenRegistratieRederType = DecosZaakBase & {
  linkDataRequest: string | null;
  caseType: GetCaseType<'VarenRederRegistratie'>;
  title: 'Varen registratie reder';
  decision: 'Verleend' | 'Ingetrokken';
  company: string | null;
  bsnkvk: string | null;
  address: string | null;
  postalCode: string | null;
  correspondenceAddress: string | null;
  city: string | null;
  phone: string | null;
  email: string | null;
};

export type VarenRegistratieRederFrontend = VarenRegistratieRederType & {
  dateRequestFormatted: string;
};

export type Varen =
  | VarenVergunningLigplaatsType
  | VarenVergunningExploitatieType
  | VarenVergunningExploitatieWijzigingVaartuigNaamType
  | VarenVergunningExploitatieWijzigingVerbouwingType
  | VarenVergunningExploitatieWijzigingVergunningshouderType
  | VarenVergunningExploitatieWijzigingVervangingType;

export type VarenZakenFrontend<T extends Varen = Varen> = OmitMapped<
  T,
  'statusDates' | 'termijnDates' | 'vergunningen'
> & {
  dateRequestFormatted: string;
  dateDecisionFormatted: string | null;
} & ZaakDetail<T['status']>;
