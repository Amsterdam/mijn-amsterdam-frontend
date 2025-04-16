import { StadspasFrontend } from './stadspas-types';
import {
  GenericDocument,
  ZaakDetail,
} from '../../../universal/types/App.types';
import { BeschikkingsResultaat } from '../zorgned/zorgned-types';

export interface HLIRegeling extends ZaakDetail {
  dateDecision: string;
  dateEnd: string | null;
  dateStart: string | null;
  documents: GenericDocument[];
  isActual: boolean; // Indicates if this item is designated Current or Previous
  receiver: string;
  decision: BeschikkingsResultaat;
}

export interface HLIresponseData {
  regelingen: HLIRegeling[];
  stadspas: StadspasFrontend[] | null;
}
