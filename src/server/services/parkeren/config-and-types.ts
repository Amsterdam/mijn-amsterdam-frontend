import { CaseTypeV2, GetCaseType } from '../../../universal/types/decos-zaken';
import {
  DecosZaakBase,
  WithLocation,
  WithDateRange,
  WithKentekens,
  WithDateTimeRange,
} from '../decos/config-and-types';
import { VergunningFrontend } from '../vergunningen/config-and-types';

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
  WithLocation & {
    caseType: GetCaseType<'GPK'>;
    cardType: 'driver' | 'passenger';
    cardNumber: number | null;
    dateEnd: string | null;
    requestReason: string | null;
  };

export type GPP = DecosZaakBase &
  WithLocation & {
    caseType: typeof CaseTypeV2.GPP;
    kentekens: string | null;
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
  VergunningFrontend<DecosParkeerVergunning>;
