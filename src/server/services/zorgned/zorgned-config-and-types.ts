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
  lineItemTransformers: ZorgnedStatusLineItemTransformerConfig[];
  productsoortCodes: ProductSoortCode[];
  productIdentificatie?: ProductIdentificatie[];
}

export type LeveringsVorm = 'ZIN' | 'PGB' | '';
export type ProductSoortCode = string;
export type ProductIdentificatie = string;

export interface Levering {
  begindatum: string | null;
  einddatum: string | null;
}

interface Toewijzing {
  datumOpdracht: string;
  leveringen: Levering[];
}

interface Leverancier {
  omschrijving: string;
}

export type BeschikkingsResultaat = 'toegewezen' | string;

export interface ToegewezenProduct {
  actueel: boolean;
  betrokkenen?: string[];
  datumEindeGeldigheid: string;
  datumIngangGeldigheid: string;
  leverancier: Leverancier;
  leveringsvorm: LeveringsVorm;
  toewijzingen: Toewijzing[];
}

export interface BeschiktProduct {
  product: {
    omschrijving: string;
    productsoortCode: ProductSoortCode;
    identificatie?: ProductIdentificatie;
  };
  resultaat: BeschikkingsResultaat;
  toegewezenProduct: ToegewezenProduct | null;
}

interface Beschikking {
  beschikkingNummer: number;
  beschikteProducten: BeschiktProduct[];
  datumAfgifte: string;
}

export interface ZorgnedDocument {
  datumDefinitief: string | null;
  documentidentificatie: string;
  omschrijving: string;
  zaakidentificatie: string | null;
}

export interface ZorgnedDocumentData {
  data: Buffer;
  mimetype: string;
  title: string;
}

export interface ZorgnedAanvraagSource {
  beschikking: Beschikking;
  datumAanvraag: string;
  documenten: ZorgnedDocument[];
  identificatie: string;
}

export interface ZorgnedResponseDataSource {
  _embedded: { aanvraag: ZorgnedAanvraagSource[] };
}

export interface ZorgnedAanvraagTransformed {
  betrokkenen: string[];
  datumAanvraag: string;
  datumBeginLevering: string | null;
  datumBesluit: string;
  datumEindeGeldigheid: string | null;
  datumEindeLevering: string | null;
  datumIngangGeldigheid: string | null;
  datumOpdrachtLevering: string | null;
  documenten: GenericDocument[];
  id: string;
  isActueel: boolean;
  leverancier: string;
  leveringsVorm: LeveringsVorm;
  productsoortCode: ProductSoortCode;
  productIdentificatie?: ProductIdentificatie;
  resultaat: BeschikkingsResultaat;
  titel: string;
}
