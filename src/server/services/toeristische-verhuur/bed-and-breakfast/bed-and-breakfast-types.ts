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

export const documentNamesMA = {
  TOEKENNING: 'Besluit toekenning',
  VERLENGING: 'Besluit verlenging beslistermijn',
  WEIGERING: 'Besluit weigering',
  BUITEN_BEHANDELING: 'Besluit Buiten behandeling',
  INTREKKING: 'Besluit intrekking',
  MEER_INFORMATIE: 'Verzoek aanvullende gegevens',
  SAMENVATTING: 'Samenvatting aanvraagformulier',
} as const;

export const documentNamenMA_PB = {
  [documentNamesMA.TOEKENNING]: [
    'BB Besluit vergunning bed and breakfast',
    'BB Besluit van rechtswege',
  ],
  [documentNamesMA.VERLENGING]: ['BB Besluit verlenging beslistermijn'],
  [documentNamesMA.BUITEN_BEHANDELING]: [
    'BB Besluit buiten behandeling stellen',
    'BB buiten behandeling stellen',
  ],
  [documentNamesMA.WEIGERING]: [
    'Besluit weigering',
    'BB Besluit weigeren vergunning',
    'BB Besluit weigeren vergunning quotum',
    'Besluit B&B weigering zonder overgangsrecht',
  ],
  [documentNamesMA.INTREKKING]: [
    'Intrekken vergunning',
    'BB Intrekkingsbesluit nav niet voldoen aan voorwaarden',
    'BB Intrekkingsbesluit op eigen verzoek',
  ],
  [documentNamesMA.MEER_INFORMATIE]: ['BB Verzoek aanvullende gegevens'],
  [documentNamesMA.SAMENVATTING]: ['Samenvatting'],
} as const;
