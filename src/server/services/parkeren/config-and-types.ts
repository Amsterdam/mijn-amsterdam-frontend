import { ZaakDetail } from '../../../universal/types';
import {
  BZP,
  EigenParkeerplaats,
  EigenParkeerplaatsOpheffen,
  GPK,
  GPP,
  TouringcarDagontheffing,
  TouringcarJaarontheffing,
} from '../vergunningen/vergunningen';

export type Parkeervergunning =
  | GPK
  | GPP
  | BZP
  | EigenParkeerplaats
  | EigenParkeerplaatsOpheffen
  | TouringcarDagontheffing
  | TouringcarJaarontheffing;

export type ParkeervergunningFrontend<
  T extends Parkeervergunning = Parkeervergunning,
> = T & {
  dateDecisionFormatted?: string | null;
  dateInBehandelingFormatted: string | null;
  dateRequestFormatted: string;
  dateStartFormatted?: string | null;
  dateEndFormatted?: string | null;
  isExpired?: boolean;
} & ZaakDetail;
