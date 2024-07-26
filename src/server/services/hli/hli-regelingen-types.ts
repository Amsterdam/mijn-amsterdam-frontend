import {
  GenericDocument,
  ZaakDetail,
} from '../../../universal/types/App.types';
import { BeschikkingsResultaat } from '../zorgned/zorgned-config-and-types';
import { StadspasFrontend } from './stadspas-types';

export interface HLIRegeling extends ZaakDetail {
  dateDecision: string;
  dateEnd: string | null;
  dateStart: string | null;
  displayStatus: string;
  documents: GenericDocument[];
  isActual: boolean; // Indicates if this item is designated Current or Previous
  receiver: string;
  decision: BeschikkingsResultaat;
}

export interface HLIresponseData {
  regelingen: HLIRegeling[];
  stadspas: StadspasFrontend[] | null;
}
