import { OmitMapped } from '../../../universal/helpers/utils';
import { DecosZaakBase, DecosZaakFrontend } from '../decos/decos-types';

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
  ZaakRederRegistratie: 'Varen registratie reder',
  ZaakVergunningExploitatie: 'Varen vergunning exploitatie',
  ZaakVergunningExploitatieWijzigingVergunningshouder:
    'Varen vergunning exploitatie Wijziging vergunninghouder',
  ZaakVergunningExploitatieWijzigingVervanging:
    'Varen vergunning exploitatie Wijziging vervanging',
  ZaakVergunningExploitatieWijzigingVerbouwing:
    'Varen vergunning exploitatie Wijziging verbouwing',
  ZaakVergunningExploitatieWijzigingVaartuignaam:
    'Varen vergunning exploitatie Wijziging vaartuignaam',
} as const;

type CaseTypeVarenKey = keyof typeof caseTypeVaren;
export type GetCaseType<T extends CaseTypeVarenKey> = (typeof caseTypeVaren)[T];
export type CaseTypeVaren = GetCaseType<CaseTypeVarenKey>;

export type VarenStatus =
  | 'Ontvangen'
  | 'In behandeling'
  | 'Meer informatie nodig'
  | 'Afgehandeld';

export type DecosVarenZaakVergunning = {
  id: string;
  identifier: string;
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
    decision: 'Verleend' | null;
    vergunningen: DecosVarenZaakVergunning[];
  };

export type ZaakVergunningExploitatieType = DecosVarenZaakBase & {
  caseType: GetCaseType<'ZaakVergunningExploitatie'>;
};

export type ZaakVergunningExploitatieWijzigingVaartuigNaamType =
  DecosVarenZaakBase & {
    caseType: GetCaseType<'ZaakVergunningExploitatieWijzigingVaartuignaam'>;
    vesselNameNew: string | null;
  };

export type ZaakVergunningExploitatieWijzigingVergunningshouderType =
  DecosVarenZaakBase & {
    caseType: GetCaseType<'ZaakVergunningExploitatieWijzigingVergunningshouder'>;
    statutoryName: string | null;
    businessAddress: string | null;
    correspondenceAddress: string | null;
  };

export type ZaakVergunningExploitatieWijzigingVerbouwingType =
  DecosVarenZaakBase & {
    caseType: GetCaseType<'ZaakVergunningExploitatieWijzigingVerbouwing'>;
  };

export type ZaakVergunningExploitatieWijzigingVervangingType =
  DecosVarenZaakBase & {
    caseType: GetCaseType<'ZaakVergunningExploitatieWijzigingVervanging'>;
    vesselNameNew: string | null;
  };

export type VarenRegistratieRederType = DecosZaakBase & {
  linkDataRequest: string | null;
  caseType: GetCaseType<'ZaakRederRegistratie'>;
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
  | ZaakVergunningExploitatieType
  | ZaakVergunningExploitatieWijzigingVaartuigNaamType
  | ZaakVergunningExploitatieWijzigingVerbouwingType
  | ZaakVergunningExploitatieWijzigingVergunningshouderType
  | ZaakVergunningExploitatieWijzigingVervangingType;

export type VarenZakenFrontend<T extends Varen = Varen> = DecosZaakFrontend<
  OmitMapped<T, 'vergunningen'>
> & {
  vergunning: DecosVarenZaakVergunning | null;
};
