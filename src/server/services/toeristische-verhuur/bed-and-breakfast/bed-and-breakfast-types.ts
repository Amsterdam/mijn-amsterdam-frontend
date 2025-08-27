import {
  GenericDocument,
  ZaakDetail,
} from '../../../../universal/types/App.types';
import { PowerBrowserZaakBase } from '../../powerbrowser/powerbrowser-types';

export const caseTypeBedAndBreakfast = {
  BedAndBreakfast: 'Bed en breakfast',
} as const;

export type GetCaseType<T extends keyof typeof caseTypeBedAndBreakfast> =
  (typeof caseTypeBedAndBreakfast)[T];

export type BBVergunningZaakStatus =
  | 'Ontvangen'
  | 'In behandeling'
  | 'Afgehandeld'
  | 'Verlopen'
  | null;
export type BBVergunningZaakResult =
  | 'Verleend'
  | 'Niet verleend'
  | 'Ingetrokken'
  | string
  | null;

export type BBVergunningFrontend = ZaakDetail &
  PowerBrowserZaakBase & {
    location: string | null;
    dateDecision: string | null;
    dateDecisionFormatted: string | null;
    dateEnd: string | null;
    dateEndFormatted: string | null;
    dateRequest: string | null;
    dateRequestFormatted: string | null;
    dateStart: string;
    dateStartFormatted: string | null;
    decision: BBVergunningZaakResult;
    isVerleend: boolean;
    documents: GenericDocument[];
    heeftOvergangsRecht: boolean;
    identifier: string;
    processed: boolean;
    isExpired: boolean;
    displayStatus: BBVergunningZaakStatus | BBVergunningZaakResult;
    title: 'Vergunning bed & breakfast';
  };
