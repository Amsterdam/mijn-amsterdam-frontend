import { LinkProps, ZaakDetail } from '../../../universal/types';
import { CaseTypeV2, GetCaseType } from '../../../universal/types/decos-zaken';
import {
  WithDateRange,
  WithKentekens,
  WithLocation,
  WithDateTimeRange,
  ZaakStatus,
  DecosZaakBase,
} from '../decos/decos-types';

export const NOTIFICATION_MAX_MONTHS_TO_SHOW_EXPIRED = 3;
export const NOTIFICATION_REMINDER_FROM_MONTHS_NEAR_END = 3;

export type TVMRVVObject = DecosZaakBase &
  WithLocation &
  WithKentekens &
  WithDateTimeRange & {
    caseType: GetCaseType<'TVMRVVObject'>;
  };

export type GPK = DecosZaakBase &
  WithLocation & {
    caseType: GetCaseType<'GPK'>;
    cardType: 'driver' | 'passenger';
    cardNumber: number | null;
    dateEnd: string | null;
    requestReason: string | null;
  };

export type GPP = DecosZaakBase & {
  location: string | null;
  caseType: typeof CaseTypeV2.GPP;
  kentekens: string | null;
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
  };

export type Omzettingsvergunning = DecosZaakBase &
  WithLocation & {
    caseType: GetCaseType<'Omzettingsvergunning'>;
    dateInBehandeling: string | null;
  };

export type ERVV = DecosZaakBase &
  WithLocation &
  WithDateTimeRange & {
    caseType: GetCaseType<'ERVV'>;
  };

// BZB is short for Parkeerontheffingen Blauwe zone bedrijven
export type BZB = DecosZaakBase &
  WithDateRange & {
    caseType: GetCaseType<'BZB'>;
    companyName: string | null;
    numberOfPermits: string | null;
    decision: string | null;
  };

// BZP is short for Parkeerontheffingen Blauwe zone particulieren
export type BZP = DecosZaakBase &
  WithDateRange &
  WithKentekens & {
    caseType: GetCaseType<'BZP'>;
    kentekens: string | null;
    decision: string | null;
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
    dateWorkflowVerleend: string | null;
    requestType: 'Nieuw' | 'Wijziging';
    area: 'Sloterweg-West' | 'Laan van Vlaanderen' | 'Sloterweg-Oost';
    decision: 'Verlopen' | 'Ingetrokken' | 'Vervallen' | 'Verleend';
    status: ZaakStatus & 'Actief';
  };

export type TouringcarDagontheffing = DecosZaakBase &
  WithKentekens &
  WithDateTimeRange & {
    caseType: GetCaseType<'TouringcarDagontheffing'>;
    destination: string | null;
  };

export type TouringcarJaarontheffing = DecosZaakBase &
  WithKentekens &
  WithDateRange & {
    caseType: GetCaseType<'TouringcarJaarontheffing'>;
    destination: string | null;
    routetest: boolean;
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

export type Ligplaatsvergunning = DecosZaakBase &
  WithLocation & {
    caseType: GetCaseType<'VOB'>;
    requestKind: string | null;
    reason: string | null;
    vesselKind: string | null;
    vesselName: string | null;
  };

export type Parkeerplaats = {
  fiscalNumber: string;
  houseNumber: string;
  street: string;
  type: string;
  url: string;
};

export type EigenParkeerplaatsRequestType =
  | 'Nieuwe aanvraag'
  | 'Autodeelbedrijf'
  | 'Kentekenwijziging'
  | 'Verhuizing'
  | 'Verlenging';

export type EigenParkeerplaats = DecosZaakBase &
  WithKentekens &
  WithDateRange & {
    caseType: GetCaseType<'EigenParkeerplaats'>;
    vorigeKentekens: string | null;
    requestTypes: EigenParkeerplaatsRequestType[];
    locations: Parkeerplaats[];
  };

export type EigenParkeerplaatsOpheffen = DecosZaakBase & {
  caseType: GetCaseType<'EigenParkeerplaatsOpheffen'>;
  isCarsharingpermit: boolean;
  dateEnd: string | null;
  location: Parkeerplaats;
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

export type DecosVergunning =
  | TVMRVVObject
  | GPK
  | GPP
  | EvenementMelding
  | EvenementVergunning
  | Omzettingsvergunning
  | ERVV
  | BZB
  | BZP
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
  | RVVHeleStad
  | RVVSloterweg
  | EigenParkeerplaats
  | EigenParkeerplaatsOpheffen
  | TouringcarDagontheffing
  | TouringcarJaarontheffing
  | WerkzaamhedenEnVervoerOpStraat;

export type VergunningenDecos = {
  content?: DecosVergunning[];
  status: 'OK' | 'ERROR';
};

export type DecosZaakExpirable = DecosVergunning & { dateEnd?: string | null };

export type VergunningOptions = {
  filter?: ZakenFilter;
  appRoute: string | ((vergunning: DecosVergunning) => string);
}

export type VergunningFrontendV2<T extends DecosVergunning = DecosVergunning> =
  DecosZaakFrontend<T>;

export type HorecaVergunning = VergunningFrontendV2<ExploitatieHorecabedrijf>;

export type NotificationProperty =
  | 'title'
  | 'description'
  | 'datePublished'
  | 'link';

type NotificationPropertyValue = (
  vergunning: VergunningFrontend
) => string | null;

type NotificationLink = (vergunning: VergunningFrontend) => LinkProps;

export type NotificationLinks = {
  [key in VergunningFrontend['caseType']]?: string;
};

type NotificationLabelsBase = {
  [key in Exclude<NotificationProperty, 'link'>]: NotificationPropertyValue;
};

export type NotificationLabels = NotificationLabelsBase & {
  link: NotificationLink;
};

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
