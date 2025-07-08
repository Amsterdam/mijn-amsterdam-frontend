import { type StadspasResponseFrontend } from './stadspas-types.ts';
import {
  GenericDocument,
  ZaakDetail,
} from '../../../universal/types/App.types.ts';
import {
  BeschikkingsResultaat,
  type ZorgnedAanvraagWithRelatedPersonsTransformed,
} from '../zorgned/zorgned-types.ts';

export type ZorgnedHLIRegeling =
  ZorgnedAanvraagWithRelatedPersonsTransformed & {
    datumInBehandeling?: string | null;
  };

export type HLIRegelingFrontend = ZaakDetail & {
  dateDecision: string;
  dateEnd: string | null;
  dateStart: string | null;
  documents: GenericDocument[];
  isActual: boolean; // Indicates if this item is designated Current or Previous
  receiver: string;
  decision: BeschikkingsResultaat;
};

export type HLIresponseData = {
  regelingen: HLIRegelingFrontend[];
  stadspas: StadspasResponseFrontend | null;
};
