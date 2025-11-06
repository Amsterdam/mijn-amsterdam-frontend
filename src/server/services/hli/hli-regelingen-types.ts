import { type StadspasResponseFrontend } from './stadspas-types';
import {
  GenericDocument,
  ZaakAanvraagDetail,
} from '../../../universal/types/App.types';
import {
  BeschikkingsResultaat,
  type ZorgnedAanvraagWithRelatedPersonsTransformed,
} from '../zorgned/zorgned-types';

export type ZorgnedHLIRegeling =
  ZorgnedAanvraagWithRelatedPersonsTransformed & {
    datumInBehandeling?: string | null;
  };

export type HLIRegelingFrontend = ZaakAanvraagDetail & {
  dateRequest: string;
  dateDecision: string;
  dateEnd: string | null;
  dateStart: string | null;
  documents: GenericDocument[];
  isActual: boolean; // Indicates if this item is designated Current or Previous
  decision: BeschikkingsResultaat;
  betrokkenen: string;
};

export type HLIresponseData = {
  regelingen: HLIRegelingFrontend[];
  stadspas: StadspasResponseFrontend | null;
  specificaties: HLIRegelingSpecificatieFrontend[];
};

export type HLIRegelingSpecificatieFrontend = GenericDocument & {
  category: string;
  datePublishedFormatted: string;
};
