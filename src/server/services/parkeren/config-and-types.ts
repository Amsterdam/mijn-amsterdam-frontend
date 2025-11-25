import { DecosZaakBase, type DecosZaakFrontend } from '../decos/decos-types';
import {
  WithLocation,
  WithDateRange,
  WithKentekens,
  WithDateTimeRange,
  WithDateEnd,
  type WithDateStart,
} from '../vergunningen/config-and-types';

export const caseTypeParkeren = {
  GPK: 'GPK',
  GPP: 'GPP',
  BZP: 'Parkeerontheffingen Blauwe zone particulieren',
  BZB: 'Parkeerontheffingen Blauwe zone bedrijven',
  EigenParkeerplaats: 'Eigen parkeerplaats',
  EigenParkeerplaatsOpheffen: 'Eigen parkeerplaats opheffen',
  TouringcarDagontheffing: 'Touringcar Dagontheffing',
  TouringcarJaarontheffing: 'Touringcar Jaarontheffing',
} as const;

export type CaseTypeParkeren = keyof typeof caseTypeParkeren;
export type GetCaseType<T extends CaseTypeParkeren> =
  (typeof caseTypeParkeren)[T];

type BaseSourceResponse<T> = {
  result: 'success' | unknown;
  count: number;
  data: T;
};

export type ActivePermitSourceResponse = BaseSourceResponse<
  ActivePermitRequestProps[]
>;

type ActivePermitRequestProps = {
  link: string;
  id: number;
  client_id: number;
  status: string;
  permit_name: string;
  permit_zone: string;
};

type ClientProductDetailsProps = {
  client_product_id: number;
  object: string;
  client_id: number;
  status: string;
  started_at: string;
  ended_at: string;
  zone: string;
  link: string;
  vrns: string;
};

export type ClientProductDetailsSourceResponse = BaseSourceResponse<
  ClientProductDetailsProps[]
>;

export type GPK = DecosZaakBase &
  WithDateStart &
  WithDateEnd &
  WithLocation & {
    caseType: GetCaseType<'GPK'>;
    cardType: 'driver' | 'passenger';
    cardNumber: number | null;
    requestReason: string | null;
  };

export type GPP = DecosZaakBase &
  WithLocation & {
    caseType: GetCaseType<'GPP'>;
    kentekens: string | null;
    kentekenNieuw: string | null;
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

export type Parkeerplaats = {
  fiscalNumber: string | null;
  houseNumber: string | null;
  street: string | null;
  type: string | null;
  url: string | null;
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

export type EigenParkeerplaatsOpheffen = DecosZaakBase &
  WithKentekens & {
    caseType: GetCaseType<'EigenParkeerplaatsOpheffen'>;
    isCarsharingpermit: boolean;
    dateEnd: string | null;
    location: Parkeerplaats;
  };

export type DecosParkeerVergunning =
  | GPK
  | GPP
  | BZB
  | BZP
  | TouringcarDagontheffing
  | TouringcarJaarontheffing
  | EigenParkeerplaats
  | EigenParkeerplaatsOpheffen;

export type ParkeerVergunningFrontend =
  DecosZaakFrontend<DecosParkeerVergunning>;
