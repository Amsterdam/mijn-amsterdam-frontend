import { GenericDocument } from '../../../universal/types';

export const ZORGNED_GEMEENTE_CODE = '0363';

export type TextPartContent = string;
export type TextPartContentTransformer = (
  data: ZorgnedAanvraagTransformed,
  today: Date
) => TextPartContent;

export type TextPartContents = TextPartContent | TextPartContentTransformer;

export type LeveringsVormConfig = Record<LeveringsVorm, ProductSoortCode[]>;

export type ZorgnedStatusLineItemTransformerConfig = {
  status: string;
  datePublished: TextPartContents;
  description: TextPartContents;
  isChecked: (
    stepIndex: number,
    data: ZorgnedAanvraagTransformed,
    today: Date
  ) => boolean;
  isActive: (
    stepIndex: number,
    data: ZorgnedAanvraagTransformed,
    today: Date
  ) => boolean;
  isVisible?: (
    stepIndex: number,
    data: ZorgnedAanvraagTransformed,
    today: Date
  ) => boolean;
};

export interface ZorgnedStatusLineItemsConfig {
  leveringsVorm: LeveringsVorm;
  productsoortCodes: ProductSoortCode[];
  lineItemTransformers: ZorgnedStatusLineItemTransformerConfig[];
}

export type LeveringsVorm = 'ZIN' | 'PGB' | '';
export type ProductSoortCode = string;

export interface Levering {
  begindatum: string | null;
  einddatum: string | null;
}

interface Toewijzing {
  leveringen: Levering[];
  datumOpdracht: string;
}

interface Leverancier {
  omschrijving: string;
}

export type BeschikkingsResultaat = 'toegewezen' | string;

export interface ToegewezenProduct {
  actueel: boolean;
  datumEindeGeldigheid: string;
  datumIngangGeldigheid: string;
  toewijzingen: Toewijzing[];
  leveringsvorm: LeveringsVorm;
  leverancier: Leverancier;
}

export interface BeschiktProduct {
  toegewezenProduct: ToegewezenProduct;
  product: {
    productsoortCode: ProductSoortCode;
    omschrijving: string;
  };
  resultaat: BeschikkingsResultaat;
}

interface Beschikking {
  beschikkingNummer: number;
  datumAfgifte: string;
  beschikteProducten: BeschiktProduct[];
}

export interface ZorgnedDocument {
  documentidentificatie: string;
  omschrijving: string;
  datumDefinitief: string | null;
  zaakidentificatie: string | null;
}

export interface ZorgnedDocumentData {
  title: string;
  mimetype: string;
  data: Buffer;
}

export interface ZorgnedAanvraagSource {
  identificatie: string;
  beschikking: Beschikking;
  datumAanvraag: string;
  documenten: ZorgnedDocument[];
}

export interface ZorgnedResponseDataSource {
  _embedded: { aanvraag: ZorgnedAanvraagSource[] };
}

export interface ZorgnedAanvraagTransformed {
  id: string;
  datumAanvraag: string;
  datumBesluit: string;
  datumEindeGeldigheid: string;
  datumIngangGeldigheid: string;
  documenten: GenericDocument[];
  isActueel: boolean;
  leverancier: string;
  datumEindeLevering: string | null;
  datumBeginLevering: string | null;
  leveringsVorm: LeveringsVorm;
  productsoortCode: ProductSoortCode;
  titel: string;
  datumOpdrachtLevering: string | null;
  resultaat: BeschikkingsResultaat;
  ontvanger: string;
}
