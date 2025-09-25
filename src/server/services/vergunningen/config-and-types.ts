import { LinkProps } from '../../../universal/types/App.types';
import { ZaakStatus } from '../../../universal/types/App.types';
import type {
  DecosZaakBase,
  WithKentekens,
  WithDateTimeRange,
  WithDateRange,
  DecosZaakFrontend,
  WithLocation,
} from '../decos/decos-types';
import type {
  PowerBrowserZaakBase,
  PowerBrowserZaakFrontend,
} from '../powerbrowser/powerbrowser-types';

export const NOTIFICATION_MAX_MONTHS_TO_SHOW_EXPIRED = 3;
export const NOTIFICATION_REMINDER_FROM_MONTHS_NEAR_END = 3;
export const MINIMUM_DAYS_FOR_WILL_EXPIRE_NOTIFICATION = 14;
export const PERCENTAGE_OF_LIFETIME_FOR_WILL_EXPIRE_NOTIFICATION = 0.8;

export const caseTypeVergunningen = {
  TVMRVVObject: 'TVM - RVV - Object',
  EvenementMelding: 'Evenement melding',
  EvenementVergunning: 'Evenement vergunning',
  ERVV: 'E-RVV - TVM',
  Flyeren: 'Flyeren-Sampling',
  AanbiedenDiensten: 'Aanbieden van diensten',
  Straatartiesten: 'Straatartiesten',
  NachtwerkOntheffing: 'Nachtwerkontheffing',
  ZwaarVerkeer: 'Zwaar verkeer',
  Samenvoegingsvergunning: 'Samenvoegingsvergunning',
  Onttrekkingsvergunning: 'Onttrekkingsvergunning voor ander gebruik',
  OnttrekkingsvergunningSloop: 'Onttrekkingsvergunning voor sloop',
  VormenVanWoonruimte: 'Woningvormingsvergunning',
  Splitsingsvergunning: 'Splitsingsvergunning',
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

export type Samenvoegingsvergunning = DecosZaakBase &
  WithLocation & {
    caseType: GetCaseType<'Samenvoegingsvergunning'>;
  };

export type Onttrekkingsvergunning = DecosZaakBase &
  WithLocation & {
    caseType: GetCaseType<'Onttrekkingsvergunning'>;
  };

export type OnttrekkingsvergunningSloop = DecosZaakBase &
  WithLocation & {
    caseType: GetCaseType<'OnttrekkingsvergunningSloop'>;
  };

export type VormenVanWoonruimte = DecosZaakBase &
  WithLocation & {
    caseType: GetCaseType<'VormenVanWoonruimte'>;
  };

export type Splitsingsvergunning = DecosZaakBase &
  WithLocation & {
    caseType: GetCaseType<'Splitsingsvergunning'>;
  };

export type WoningVergunning =
  | Samenvoegingsvergunning
  | Onttrekkingsvergunning
  | OnttrekkingsvergunningSloop
  | Splitsingsvergunning
  | VormenVanWoonruimte;

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

export type DecosVergunning =
  | TVMRVVObject
  | EvenementMelding
  | EvenementVergunning
  | ERVV
  | Flyeren
  | AanbiedenDiensten
  | Straatartiesten
  | Nachtwerkontheffing
  | ZwaarVerkeer
  | Samenvoegingsvergunning
  | Onttrekkingsvergunning
  | OnttrekkingsvergunningSloop
  | VormenVanWoonruimte
  | Splitsingsvergunning
  | RVVHeleStad
  | RVVSloterweg
  | WerkzaamhedenEnVervoerOpStraat;

/* ----------------------------------------
    Powerbrowser
  ---------------------------------------- */

export const caseTypePB = {
  Ligplaatsvergunning: 'Ligplaatsvergunning',
  Omzettingsvergunning: 'Omzettingsvergunning',
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

export type PBVergunning = Ligplaatsvergunning | Omzettingsvergunning;

export type ZaakFrontendCombined = DecosZaakFrontend | PowerBrowserZaakFrontend;

/* ----------------------------------------
    Notifications
  ---------------------------------------- */
export type NotificationProperty =
  | 'title'
  | 'description'
  | 'datePublished'
  | 'link';

type NotificationPropertyValue = (vergunning: DecosZaakFrontend) => string;

type NotificationLink = (vergunning: DecosZaakFrontend) => LinkProps;

type NotificationLabelsBase = {
  [key in Exclude<NotificationProperty, 'link'>]: NotificationPropertyValue;
};

export type NotificationLabels = NotificationLabelsBase & {
  link: NotificationLink;
};

export type NotificationTypeKey =
  | 'statusOntvangen'
  | 'statusInBehandeling'
  | 'statusAfgehandeld'
  | 'verlooptBinnenkort'
  | 'isVerlopen'
  | 'isIngetrokken';

export type NotificationLabelByType = Record<
  NotificationTypeKey,
  NotificationLabels
>;
