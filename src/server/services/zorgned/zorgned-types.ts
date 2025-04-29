import { GenericDocument } from '../../../universal/types/App.types';

export const ZORGNED_GEMEENTE_CODE = '0363';

export type TextPartContent = string;
export type TextPartContentTransformer<T> = (
  aanvraag: T,
  today: Date,
  allAanvragen: T[]
) => TextPartContent;

export type TextPartContents<T> =
  | TextPartContent
  | TextPartContentTransformer<T>;

export type LeveringsVormConfig = Record<LeveringsVorm, ProductSoortCode[]>;

export type ZorgnedStatusLineItemTransformerConfig<
  T extends ZorgnedAanvraagTransformed = ZorgnedAanvraagTransformed,
> = {
  status: string;
  datePublished: TextPartContents<T>;
  description: TextPartContents<T>;
  isChecked: (
    stepIndex: number,
    aanvraag: T,
    today: Date,
    allAanvragen: T[]
  ) => boolean;
  isActive: (
    stepIndex: number,
    aanvraag: T,
    today: Date,
    allAanvragen: T[]
  ) => boolean;
  isVisible?: (
    stepIndex: number,
    aanvraag: T,
    today: Date,
    allAanvragen: T[]
  ) => boolean;
};

type ZorgnedLineItemsFilter = (
  aanvraag:
    | ZorgnedAanvraagTransformed
    | ZorgnedAanvraagWithRelatedPersonsTransformed,
  allAanvragen:
    | ZorgnedAanvraagTransformed[]
    | ZorgnedAanvraagWithRelatedPersonsTransformed[]
) => boolean;

export interface ZorgnedStatusLineItemsConfig<
  T extends ZorgnedAanvraagTransformed = ZorgnedAanvraagTransformed,
> {
  leveringsVorm?: LeveringsVorm;
  lineItemTransformers: ZorgnedStatusLineItemTransformerConfig<T>[];
  productsoortCodes?: ProductSoortCode[];
  productIdentificatie?: ProductIdentificatie[];
  filter?: ZorgnedLineItemsFilter;
  isDisabled?: boolean;
}

export type LeveringsVorm = 'ZIN' | 'PGB' | '' | string;
export type ProductSoortCode = string;
export type ProductIdentificatie = string;

export interface Levering {
  begindatum: string | null;
  einddatum: string | null;
}

interface Toewijzing {
  datumOpdracht: string;
  leveringen: Levering[];
  toewijzingsDatumTijd: string | null;
}

interface Leverancier {
  omschrijving: string;
}

export type BeschikkingsResultaat = 'toegewezen' | 'afgewezen' | null;

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
  resultaat: BeschikkingsResultaat | null;
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
  omschrijvingclientportaal: string;
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
  datumToewijzing: string | null;
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

export interface ZorgnedAanvraagWithRelatedPersonsTransformed
  extends ZorgnedAanvraagTransformed {
  betrokkenPersonen: ZorgnedPerson[];
}

export interface ZorgnedDocumentResponseSource {
  inhoud: string;
  omschrijving: string;
  omschrijvingclientportaal: string;
  bestandsnaam: string;
  mimetype: string;
}

export interface ZorgnedPersoonsgegevensNAWResponse {
  persoon: {
    bsn: string;
    clientidentificatie: number | null;
    geboortenaam: string;
    roepnaam: string | null;
    voorletters: string;
    voornamen: string;
    voorvoegsel: string | null;
    geboortedatum: string | null;
  };
}

export interface ZorgnedPerson {
  bsn: string;
  name: string;
  dateOfBirth: string | null;
  dateOfBirthFormatted: string | null;
}

export type ZorgnedApiConfigKey =
  | 'ZORGNED_JZD'
  | 'ZORGNED_AV'
  | 'ZORGNED_LEERLINGENVERVOER';

export interface ZorgnedAanvragenServiceOptions {
  zorgnedApiConfigKey: ZorgnedApiConfigKey;
  requestBodyParams?: Record<string, string>;
}
