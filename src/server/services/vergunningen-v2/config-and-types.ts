import { LinkProps } from '../../../universal/types';
import {
  CaseTypeV2,
  DecosCaseType,
  GetCaseType,
} from '../../../universal/types/decos-zaken';
import {
  DecosZaakBase,
  DecosZaakWithDateRange,
  DecosZaakWithKentekens,
  DecosZaakWithLocation,
  DecosZaakWithDateTimeRange,
  ZaakStatus,
  ZakenFilter,
  DecosZaakFrontend,
} from '../decos/decos-types';

export const NOTIFICATION_MAX_MONTHS_TO_SHOW_EXPIRED = 3;
export const NOTIFICATION_REMINDER_FROM_MONTHS_NEAR_END = 3;

export const EXCLUDE_CASE_TYPES_FROM_VERGUNNINGEN_THEMA: DecosCaseType[] = [
  CaseTypeV2.VakantieverhuurVergunningaanvraag,
  CaseTypeV2.ExploitatieHorecabedrijf,
];

export type VergunningBase = DecosZaakBase;

export interface TVMRVVObject
  extends DecosZaakWithLocation,
    DecosZaakWithDateTimeRange,
    DecosZaakWithKentekens {
  caseType: GetCaseType<'TVMRVVObject'>;
  description: string | null;
}

export interface GPK extends DecosZaakWithLocation {
  caseType: GetCaseType<'GPK'>;
  cardType: 'driver' | 'passenger';
  cardNumber: number | null;
  dateEnd: string | null;
  requestReason: string | null;
}

export interface GPP extends DecosZaakWithLocation {
  caseType: GetCaseType<'GPP'>;
  kentekens: string | null;
}

export interface EvenementMelding
  extends DecosZaakWithLocation,
    DecosZaakWithDateTimeRange {
  caseType: GetCaseType<'EvenementMelding'>;
}

export interface EvenementVergunning
  extends DecosZaakWithLocation,
    DecosZaakWithDateTimeRange {
  caseType: GetCaseType<'EvenementVergunning'>;
}

export interface Omzettingsvergunning extends DecosZaakWithLocation {
  caseType: GetCaseType<'Omzettingsvergunning'>;
  dateInBehandeling: string | null;
}

export interface ERVV
  extends DecosZaakWithLocation,
    DecosZaakWithDateTimeRange {
  caseType: GetCaseType<'ERVV'>;
}

export interface VakantieverhuurVergunningaanvraag
  extends DecosZaakWithLocation,
    DecosZaakWithDateRange {
  caseType: GetCaseType<'VakantieverhuurVergunningaanvraag'>;
  title: 'VergunningV2 vakantieverhuur';
  decision: 'Verleend' | 'Ingetrokken';
}

// BZB is short for Parkeerontheffingen Blauwe zone bedrijven
export interface BZB extends DecosZaakWithDateRange {
  caseType: GetCaseType<'BZB'>;
  companyName: string | null;
  numberOfPermits: string | null;
  decision: string | null;
}

// BZP is short for Parkeerontheffingen Blauwe zone particulieren
export interface BZP extends DecosZaakWithDateRange, DecosZaakWithKentekens {
  caseType: GetCaseType<'BZP'>;
  kentekens: string | null;
  decision: string | null;
}

export interface Flyeren
  extends DecosZaakWithLocation,
    DecosZaakWithDateTimeRange {
  caseType: GetCaseType<'Flyeren'>;
  decision: 'Verleend' | 'Niet verleend' | 'Ingetrokken';
}

export interface AanbiedenDiensten
  extends DecosZaakWithLocation,
    DecosZaakWithDateRange {
  caseType: GetCaseType<'AanbiedenDiensten'>;
}

export interface Nachtwerkontheffing
  extends DecosZaakWithLocation,
    DecosZaakWithDateTimeRange {
  caseType: GetCaseType<'NachtwerkOntheffing'>;
}

export interface ZwaarVerkeer
  extends DecosZaakWithKentekens,
    DecosZaakWithDateRange {
  caseType: GetCaseType<'ZwaarVerkeer'>;
  exemptionKind: string | null;
}

export interface RVVHeleStad
  extends DecosZaakWithKentekens,
    DecosZaakWithDateRange {
  caseType: GetCaseType<'RVVHeleStad'>;
}

export interface RVVSloterweg
  extends DecosZaakWithKentekens,
    DecosZaakWithDateRange {
  caseType: GetCaseType<'RVVSloterweg'>;
  vorigeKentekens: string | null;
  dateWorkflowVerleend: string | null;
  requestType: 'Nieuw' | 'Wijziging';
  area: 'Sloterweg-West' | 'Laan van Vlaanderen' | 'Sloterweg-Oost';
  decision: 'Verlopen' | 'Ingetrokken' | 'Vervallen' | 'Verleend';
  status: ZaakStatus & 'Actief';
}

export interface TouringcarDagontheffing
  extends DecosZaakWithKentekens,
    DecosZaakWithDateTimeRange {
  caseType: GetCaseType<'TouringcarDagontheffing'>;
  destination: string | null;
}

export interface TouringcarJaarontheffing
  extends DecosZaakWithKentekens,
    DecosZaakWithDateRange {
  caseType: GetCaseType<'TouringcarJaarontheffing'>;
  destination: string | null;
  routetest: boolean;
}

export interface Samenvoegingsvergunning extends DecosZaakWithLocation {
  caseType: GetCaseType<'Samenvoegingsvergunning'>;
}

export interface Onttrekkingsvergunning extends DecosZaakWithLocation {
  caseType: GetCaseType<'Onttrekkingsvergunning'>;
}

export interface OnttrekkingsvergunningSloop extends DecosZaakWithLocation {
  caseType: GetCaseType<'OnttrekkingsvergunningSloop'>;
}

export interface VormenVanWoonruimte extends DecosZaakWithLocation {
  caseType: GetCaseType<'VormenVanWoonruimte'>;
}

export interface Splitsingsvergunning extends DecosZaakWithLocation {
  caseType: GetCaseType<'Splitsingsvergunning'>;
}

export interface ExploitatieHorecabedrijf
  extends DecosZaakWithLocation,
    DecosZaakWithDateRange {
  caseType: GetCaseType<'ExploitatieHorecabedrijf'>;
  dateStartPermit: string | null;
  numberOfPermits: string | null;
}

export interface Ligplaatsvergunning extends DecosZaakWithLocation {
  caseType: GetCaseType<'VOB'>;
  requestKind: string | null;
  reason: string | null;
  vesselKind: string | null;
  vesselName: string | null;
}

export interface Parkeerplaats {
  fiscalNumber: string;
  houseNumber: string;
  street: string;
  type: string;
  url: string;
}

export type EigenParkeerplaatsRequestType =
  | 'Nieuwe aanvraag'
  | 'Autodeelbedrijf'
  | 'Kentekenwijziging'
  | 'Verhuizing'
  | 'Verlenging';

export interface EigenParkeerplaats
  extends VergunningBase,
    DecosZaakWithKentekens,
    DecosZaakWithDateRange {
  caseType: GetCaseType<'EigenParkeerplaats'>;
  vorigeKentekens: string | null;
  requestTypes: EigenParkeerplaatsRequestType[];
  locations: Parkeerplaats[];
}

export interface EigenParkeerplaatsOpheffen extends VergunningBase {
  caseType: GetCaseType<'EigenParkeerplaatsOpheffen'>;
  isCarsharingpermit: boolean;
  dateEnd: string | null;
  location: Parkeerplaats;
}

export type WVOSActiviteit =
  | 'Rijden of een voertuig neerzetten waar dat normaal niet mag'
  | 'Object(en) neerzetten'
  | 'Parkeervakken reserveren'
  | 'Een straat afzetten'
  | 'Werkzaamheden verrichten in de nacht'
  | 'Fietsen en/of fietsenrekken weg laten halen voor werkzaamheden'
  | 'Verhuizing tussen twee locaties binnen Amsterdam'
  | 'Filmen';

export interface WerkzaamhedenEnVervoerOpStraat
  extends DecosZaakWithLocation,
    DecosZaakWithDateRange,
    DecosZaakWithKentekens {
  caseType: GetCaseType<'WVOS'>;
  werkzaamheden: WVOSActiviteit[];
}

export type VergunningV2 =
  | TVMRVVObject
  | GPK
  | GPP
  | EvenementMelding
  | EvenementVergunning
  | Omzettingsvergunning
  | ERVV
  | BZB
  | BZP
  | VakantieverhuurVergunningaanvraag
  | Flyeren
  | AanbiedenDiensten
  | Nachtwerkontheffing
  | ZwaarVerkeer
  | Samenvoegingsvergunning
  | Onttrekkingsvergunning
  | OnttrekkingsvergunningSloop
  | VormenVanWoonruimte
  | Splitsingsvergunning
  | Ligplaatsvergunning
  | ExploitatieHorecabedrijf
  | RVVHeleStad
  | RVVSloterweg
  | EigenParkeerplaats
  | EigenParkeerplaatsOpheffen
  | TouringcarDagontheffing
  | TouringcarJaarontheffing
  | WerkzaamhedenEnVervoerOpStraat;

export type VergunningenSourceData = {
  content?: VergunningV2[];
  status: 'OK' | 'ERROR';
};

export type DecosZaakExpirable = VergunningV2 & { dateEnd?: string | null };

export interface VergunningOptions {
  filter?: ZakenFilter;
  appRoute: string | ((vergunning: VergunningV2) => string);
}

export type VergunningFrontendV2<T extends VergunningV2 = VergunningV2> =
  DecosZaakFrontend<T>;

export type HorecaVergunning = VergunningFrontendV2<ExploitatieHorecabedrijf>;

export type NotificationProperty =
  | 'title'
  | 'description'
  | 'datePublished'
  | 'link';

type NotificationPropertyValue = (
  vergunning: VergunningFrontendV2
) => string | null;

type NotificationLink = (vergunning: VergunningFrontendV2) => LinkProps;

export type NotificationLinks = {
  [key in VergunningFrontendV2['caseType']]?: string;
};

type NotificationLabelsBase = {
  [key in Exclude<NotificationProperty, 'link'>]: NotificationPropertyValue;
};

export interface NotificationLabels extends NotificationLabelsBase {
  link: NotificationLink;
}

export type NotificationTypeKey =
  | 'statusAanvraag'
  | 'statusInBehandeling'
  | 'statusAfgehandeld'
  | 'verlooptBinnenkort'
  | 'isVerlopen'
  | 'isIngetrokken';

export type NotificationLabelByType = Record<
  NotificationTypeKey,
  NotificationLabels
>;
