import {
  GenericDocument,
  ZaakDetail,
} from '../../../universal/types/App.types';
import { StadspasFrontend } from './stadspas-types';

export interface HLIRegeling extends ZaakDetail {
  dateDescision: string;
  dateEnd: string | null;
  dateStart: string | null;
  displayStatus: string;
  documents: GenericDocument[];
  isActual: boolean; // Indicates if this item is designated Current or Previous
  receiver: string;
}

export interface ZorgnedPersoonsgegevensNAWResponse {
  persoon: {
    clientidentificatie: number | null;
    geboortenaam: string;
    roepnaam: string | null;
    voorletters: string;
    voornamen: string;
    voorvoegsel: string | null;
  };
}

export interface ZorgnedLevering {
  begindatum: string | null;
  einddatum: string | null;
}

interface ZorgnedToewijzing {
  leveringen: ZorgnedLevering[];
  datumOpdracht: string;
}

interface ZorgnedLeverancier {
  omschrijving: string;
}

export type ZorgnedBeschikkingsResultaat = 'toegewezen' | string;

export interface ZorgnedToegewezenProduct {
  actueel: boolean;
  datumEindeGeldigheid: string;
  datumIngangGeldigheid: string;
  toewijzingen: ZorgnedToewijzing[];
  leveringsvorm: ''; // ?????
  leverancier: ZorgnedLeverancier;
}

export interface ZorgnedBeschiktProduct {
  toegewezenProduct: ZorgnedToegewezenProduct;
  product: {
    productsoortCode: string | null;
    omschrijving: string;
  };
  resultaat: ZorgnedBeschikkingsResultaat;
}

interface ZorgnedBeschikking {
  beschikkingNummer: number;
  datumAfgifte: string;
  beschikteProducten: ZorgnedBeschiktProduct[];
}

export interface ZorgnedDocument {
  documentidentificatie: string;
  omschrijving: string;
  datumDefinitief: string;
  zaakidentificatie: string | null;
}

export interface ZorgnedDocumentData {
  title: string;
  mimetype: string;
  data: Buffer;
}

export interface ZorgnedRegelingAanvraag {
  identificatie: string;
  beschikking: ZorgnedBeschikking;
  datumAanvraag: string;
  documenten: ZorgnedDocument[];
}

export interface RegelingenSourceResponseData {
  _embedded: { aanvraag: ZorgnedRegelingAanvraag[] };
}

export interface HLIresponseData {
  regelingen: HLIRegeling[];
  stadspas: StadspasFrontend[] | null;
}
