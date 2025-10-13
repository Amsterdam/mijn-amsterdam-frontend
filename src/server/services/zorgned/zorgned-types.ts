import { GenericDocument } from '../../../universal/types/App.types';
import type { AuthProfile } from '../../auth/auth-types';
import { GEMEENTE_CODE_AMSTERDAM } from '../brp/brp-config';

export const ZORGNED_GEMEENTE_CODE = GEMEENTE_CODE_AMSTERDAM;

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
  isChecked:
    | ((aanvraag: T, today: Date, allAanvragen: T[]) => boolean)
    | boolean;
  isActive:
    | ((aanvraag: T, today: Date, allAanvragen: T[]) => boolean)
    | boolean;
  isVisible?:
    | ((aanvraag: T, today: Date, allAanvragen: T[]) => boolean)
    | boolean;
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
  resultaat?: BeschikkingsResultaat;
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
  identificatie: string;
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
  datumAfgifte?: string;
}

export interface ZorgnedDocument {
  datumDefinitief: string | null;
  documentidentificatie: string;
  omschrijving: string;
  omschrijvingclientportaal: string;
  zaakidentificatie: string | null;
  /** Some kind of code followed by a filename. Example: `"BR3400279.pdf"` */
  bestandsnaam: string;
}

export interface ZorgnedDocumentData {
  data: Buffer;
  mimetype: string;
  title: string;
}

export interface ZorgnedAanvraagSource {
  beschikking: Beschikking;
  datumAanvraag: string;
  // The following field seems to be always defined for RTM type aanvragen.
  procesAanvraag?: ZorgnedProcesAanvraag;
  documenten: ZorgnedDocument[];
  identificatie: string;
}

export type ZorgnedProcesAanvraag = {
  identificatie: string; // Is equal to ZorgnedAanvraagSource identificatie
  omschrijving: string;
  datumStart: string;
};

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
  procesAanvraagOmschrijving: string | null;
  documenten: GenericDocument[];
  id: string;
  isActueel: boolean;
  leverancier: string;
  leveringsVorm: LeveringsVorm;
  productsoortCode: ProductSoortCode;
  productIdentificatie?: ProductIdentificatie;
  beschiktProductIdentificatie: BeschiktProduct['identificatie'];
  resultaat: BeschikkingsResultaat;
  titel: string;
}

export interface ZorgnedAanvraagWithRelatedPersonsTransformed
  extends ZorgnedAanvraagTransformed {
  betrokkenPersonen: ZorgnedPerson[];
  bsnAanvrager: BSN;
}

export interface ZorgnedDocumentResponseSource {
  inhoud: string;
  omschrijving: string;
  omschrijvingclientportaal: string;
  bestandsnaam: string;
  mimetype: string;
}

export interface ZorgnedPersoonsgegevensNAWResponse {
  persoon?: {
    bsn: string;
    clientidentificatie: number | null;
    geboortenaam: string;
    roepnaam: string | null;
    voorletters: string;
    voornamen: string;
    voorvoegsel: string | null;
    geboortedatum: string | null;
    partnernaam?: string | null;
    partnervoorvoegsel?: string | null;
  };
}

export interface ZorgnedRelatieSource {
  persoon: {
    persoontype: 'P' | 'O';
  };
  inschrijfadres: {
    adrestype: 'R' | 'P' | 'A';
    huisnummer: number;
    huisletter: string;
    huisnummerToevoeging: string;
    postcode: string;
    straatnaam: string;
    plaats: string;
  };
  contactgegevens: {
    telefoonnummer1: {
      telefoonnummer: string;
      landnummer: string;
    };
    telefoonnummer2: {
      telefoonnummer: string;
      landnummer: string;
    };
    emailadres: string;
    correspondentieadres: {
      adrestype: 'R' | 'P' | 'A';
    };
  };
  soort: {
    code: number;
    omschrijving: string;
  };
}

export interface ZorgnedPerson {
  bsn: string;
  name: string;
  dateOfBirth: string | null;
  dateOfBirthFormatted: string | null;
  isPartner?: true;
  isAanvrager?: true;
  partnernaam: string | null;
  partnervoorvoegsel: string | null;
}

export type ZorgnedApiConfigKey =
  | 'ZORGNED_JZD'
  | 'ZORGNED_AV'
  | 'ZORGNED_LEERLINGENVERVOER';

export interface ZorgnedAanvragenServiceOptions {
  zorgnedApiConfigKey: ZorgnedApiConfigKey;
  requestBodyParams?: Record<string, string>;
}

export type BSN = AuthProfile['id'];
