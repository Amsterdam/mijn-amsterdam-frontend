import { ZaakStatus } from '../../../universal/types/App.types';
import type { DecosZaakBase, DecosZaakFrontend } from '../decos/decos-types';
export type { DecosZaakFrontend } from '../decos/decos-types';
import type {
  PowerBrowserZaakBase,
  PowerBrowserZaakFrontend,
} from '../powerbrowser/powerbrowser-types';

export const NOTIFICATION_MAX_MONTHS_TO_SHOW_EXPIRED = 3;
export const NOTIFICATION_REMINDER_FROM_MONTHS_NEAR_END = 3;
export const MINIMUM_DAYS_FOR_WILL_EXPIRE_NOTIFICATION = 14;
export const PERCENTAGE_OF_LIFETIME_FOR_WILL_EXPIRE_NOTIFICATION = 0.8;

export type WithLocation = {
  location: string | null;
};

export type WithKentekens = {
  kentekens: string | null;
};

export type WithDateStart = {
  dateStart: string | null;
  dateStartFormatted: string | null;
};

export type WithDateEnd = {
  dateEnd: string | null;
  dateEndFormatted: string | null;
};

export type WithDateRange = WithDateStart & WithDateEnd;

export type WithTimeRange = {
  timeStart: string | null;
  timeEnd: string | null;
};
export type WithDateTimeRange = WithDateRange & WithTimeRange; // A list of common readable api attributes

export const caseTypeVergunningen = {
  // TODO: MIJN-12357: Remove after move to Powerbrowser is finalized
  Omzettingsvergunning: 'Omzettingsvergunning',
  Samenvoegingsvergunning: 'Samenvoegingsvergunning',
  Onttrekkingsvergunning: 'Onttrekkingsvergunning voor ander gebruik',
  OnttrekkingsvergunningSloop: 'Onttrekkingsvergunning voor sloop',
  VormenVanWoonruimte: 'Woningvormingsvergunning',
  VOB: 'VOB',

  TVMRVVObject: 'TVM - RVV - Object',
  EvenementMelding: 'Evenement melding',
  EvenementVergunning: 'Evenement vergunning',
  ERVV: 'E-RVV - TVM',
  Flyeren: 'Flyeren-Sampling',
  AanbiedenDiensten: 'Aanbieden van diensten',
  Straatartiesten: 'Straatartiesten',
  NachtwerkOntheffing: 'Nachtwerkontheffing',
  ZwaarVerkeer: 'Zwaar verkeer',
  RVVHeleStad: 'RVV - Hele stad',
  RVVSloterweg: 'RVV Sloterweg',
  WVOS: 'Werk en vervoer op straat',
} as const;

type CaseTypeVergunningenKey = keyof typeof caseTypeVergunningen;
export type CaseTypeVergunningen =
  (typeof caseTypeVergunningen)[CaseTypeVergunningenKey];
export type GetCaseType<T extends CaseTypeVergunningenKey> =
  (typeof caseTypeVergunningen)[T];

export type TVMRVVObject = DecosZaakBase &
  WithLocation &
  WithKentekens &
  WithDateTimeRange & {
    caseType: GetCaseType<'TVMRVVObject'>;
    description: string | null;
  };

export type EvenementMelding = DecosZaakBase &
  WithLocation &
  WithDateTimeRange & {
    caseType: GetCaseType<'EvenementMelding'>;
  };

export type EvenementVergunning = DecosZaakBase &
  WithLocation &
  WithDateTimeRange & {
    caseType: GetCaseType<'EvenementVergunning'>;
    description: string | null;
  };

export type ERVV = DecosZaakBase &
  WithLocation &
  WithDateTimeRange & {
    caseType: GetCaseType<'ERVV'>;
    description: string | null;
  };

export type Flyeren = DecosZaakBase &
  WithLocation &
  WithDateTimeRange & {
    caseType: GetCaseType<'Flyeren'>;
    decision: 'Verleend' | 'Niet verleend' | 'Ingetrokken';
  };

export type AanbiedenDiensten = DecosZaakBase &
  WithLocation &
  WithDateRange & {
    caseType: GetCaseType<'AanbiedenDiensten'>;
    category: string | null;
    stadsdeel: string | null;
  };

export type Straatartiesten = DecosZaakBase &
  WithLocation &
  WithDateRange & {
    caseType: GetCaseType<'Straatartiesten'>;
    category: string | null;
    stadsdeel: string | null;
  };

export type Nachtwerkontheffing = DecosZaakBase &
  WithLocation &
  WithDateTimeRange & {
    caseType: GetCaseType<'NachtwerkOntheffing'>;
  };

export type ZwaarVerkeer = DecosZaakBase &
  WithKentekens &
  WithDateRange & {
    caseType: GetCaseType<'ZwaarVerkeer'>;
    exemptionKind: string | null;
  };

export type RVVHeleStad = DecosZaakBase &
  WithKentekens &
  WithDateRange & {
    caseType: GetCaseType<'RVVHeleStad'>;
  };

export type RVVSloterweg = DecosZaakBase &
  WithKentekens &
  WithDateRange & {
    caseType: GetCaseType<'RVVSloterweg'>;
    vorigeKentekens: string | null;
    dateWorkflowActive: string | null;
    dateWorkflowVerleend: string | null;
    requestType: 'Nieuw' | 'Wijziging';
    area: 'Sloterweg-West' | 'Laan van Vlaanderen' | 'Sloterweg-Oost';
    decision: 'Verlopen' | 'Ingetrokken' | 'Vervallen' | 'Verleend';
    status: ZaakStatus & 'Actief';
  };

export type WVOSActiviteit =
  | 'Rijden of een voertuig neerzetten waar dat normaal niet mag'
  | 'Object(en) neerzetten'
  | 'Parkeervakken reserveren'
  | 'Een straat afzetten'
  | 'Werkzaamheden verrichten in de nacht'
  | 'Fietsen en/of fietsenrekken weg laten halen voor werkzaamheden'
  | 'Verhuizing tussen twee locaties binnen Amsterdam'
  | 'Filmen';

export type WerkzaamhedenEnVervoerOpStraat = DecosZaakBase &
  WithLocation &
  WithDateRange &
  WithKentekens & {
    caseType: GetCaseType<'WVOS'>;
    werkzaamheden: WVOSActiviteit[];
  };

export type LigplaatsvergunningDecos = DecosZaakBase &
  WithLocation & {
    caseType: GetCaseType<'VOB'>;
    requestKind: string | null;
    reason: string | null;
    vesselKind: string | null;
    vesselName: string | null;
  };

export type OmzettingsvergunningDecos = DecosZaakBase &
  WithLocation & {
    caseType: GetCaseType<'Omzettingsvergunning'>;
    dateInBehandeling: string | null;
  };

export type SamenvoegingsvergunningDecos = DecosZaakBase &
  WithLocation & {
    caseType: GetCaseType<'Samenvoegingsvergunning'>;
  };

export type OnttrekkingsvergunningDecos = DecosZaakBase &
  WithLocation & {
    caseType: GetCaseType<'Onttrekkingsvergunning'>;
  };

export type OnttrekkingsvergunningSloopDecos = DecosZaakBase &
  WithLocation & {
    caseType: GetCaseType<'OnttrekkingsvergunningSloop'>;
  };

export type VormenVanWoonruimteDecos = DecosZaakBase &
  WithLocation & {
    caseType: GetCaseType<'VormenVanWoonruimte'>;
  };

// TODO: MIJN-12357: Remove after move to Powerbrowser is finalized
export type WoningVergunningDecos =
  | SamenvoegingsvergunningDecos
  | OnttrekkingsvergunningDecos
  | OnttrekkingsvergunningSloopDecos
  | VormenVanWoonruimteDecos;

// TODO: MIJN-12357: Remove after move to Powerbrowser is finalized
type VTHVergunningDecos =
  | LigplaatsvergunningDecos
  | OmzettingsvergunningDecos
  | WoningVergunningDecos;

export type DecosVergunning =
  | VTHVergunningDecos
  | TVMRVVObject
  | EvenementMelding
  | EvenementVergunning
  | ERVV
  | Flyeren
  | AanbiedenDiensten
  | Straatartiesten
  | Nachtwerkontheffing
  | ZwaarVerkeer
  | RVVHeleStad
  | RVVSloterweg
  | WerkzaamhedenEnVervoerOpStraat;

/* ----------------------------------------
    Powerbrowser
  ---------------------------------------- */

export const caseTypePB = {
  Ligplaatsvergunning: 'Ligplaatsvergunning',
  Omzettingsvergunning: 'Omzettingsvergunning',
  Samenvoegingsvergunning: 'Samenvoegingsvergunning',
  Onttrekkingsvergunning: 'Onttrekkingsvergunning voor ander gebruik',
  OnttrekkingsvergunningSloop: 'Onttrekkingsvergunning voor sloop',
  VormenVanWoonruimte: 'Woningvormingsvergunning',
  Splitsingsvergunning: 'Splitsingsvergunning',
} as const;

export type CaseTypePBKey = keyof typeof caseTypePB;
export type CaseTypePB = (typeof caseTypePB)[CaseTypePBKey];
export type GetCaseTypePB<T extends CaseTypePBKey> = (typeof caseTypePB)[T];

export type Ligplaatsvergunning = PowerBrowserZaakBase &
  WithLocation & {
    caseType: GetCaseTypePB<'Ligplaatsvergunning'>;
    requestKind: string | null;
    reason: string | null;
    vesselKind: string | null;
    vesselName: string | null;
  };

export type Omzettingsvergunning = PowerBrowserZaakBase &
  WithLocation & {
    caseType: GetCaseTypePB<'Omzettingsvergunning'>;
    dateInBehandeling: string | null;
  };

export type Samenvoegingsvergunning = PowerBrowserZaakBase &
  WithLocation & {
    caseType: GetCaseTypePB<'Samenvoegingsvergunning'>;
  };

export type Onttrekkingsvergunning = PowerBrowserZaakBase &
  WithLocation & {
    caseType: GetCaseTypePB<'Onttrekkingsvergunning'>;
  };

export type OnttrekkingsvergunningSloop = PowerBrowserZaakBase &
  WithLocation & {
    caseType: GetCaseTypePB<'OnttrekkingsvergunningSloop'>;
  };

export type VormenVanWoonruimte = PowerBrowserZaakBase &
  WithLocation & {
    caseType: GetCaseTypePB<'VormenVanWoonruimte'>;
  };

export type Splitsingsvergunning = PowerBrowserZaakBase &
  WithLocation & {
    caseType: GetCaseTypePB<'Splitsingsvergunning'>;
  };

export type WoningVergunning =
  | Samenvoegingsvergunning
  | Onttrekkingsvergunning
  | OnttrekkingsvergunningSloop
  | Splitsingsvergunning
  | VormenVanWoonruimte;

export type PBVergunning =
  | Ligplaatsvergunning
  | Omzettingsvergunning
  | WoningVergunning;

export type ZaakFrontendCombined<
  T extends DecosZaakBase | PowerBrowserZaakBase =
    | DecosZaakBase
    | PowerBrowserZaakBase,
> = T extends DecosZaakBase
  ? DecosZaakFrontend<T>
  : T extends PowerBrowserZaakBase
    ? PowerBrowserZaakFrontend<T>
    : DecosZaakFrontend | PowerBrowserZaakFrontend;
