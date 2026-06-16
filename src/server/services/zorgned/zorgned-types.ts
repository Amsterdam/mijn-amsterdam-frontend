import type { GenericDocument } from '../../../universal/types/App.types.ts';
import type { AuthProfile } from '../../auth/auth-types.ts';
import type { DataRequestConfig } from '../../config/source-api.ts';
import { GEMEENTE_CODE_AMSTERDAM } from '../brp/brp-config.ts';

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

export type LeveringsVormConfig = Record<
  LeveringsVormTransformed,
  ProductSoortCode[]
>;

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
  leveringsVorm?: LeveringsVormTransformed;
  statusLineItems: {
    transformers: ZorgnedStatusLineItemTransformerConfig<T>[];
  };
  productgroep: string;
  productsoortCodes?: ProductSoortCode[];
  productIdentificatie?: ProductIdentificatie[];
  filter?: ZorgnedLineItemsFilter;
  isDisabled?: boolean;
  resultaat?: BeschikkingsResultaat;
}

export type LeveringsVorm = 'ZIN' | 'PGB' | '' | string;
export type LeveringsVormTransformed = 'ZIN' | 'PGB' | '';
export type ProductSoortCode = string;
export type ProductIdentificatie = string;
export type CasusIdentificatie = string;

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
  identificatie: string;
}

export type BeschikkingsResultaat = 'toegewezen' | 'afgewezen';

export interface ToegewezenProduct {
  actueel: boolean;
  betrokkenen?: string[];
  datumEindeGeldigheid: string | null;
  datumIngangGeldigheid: string | null;
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
  resultaat: BeschikkingsResultaat;
  toegewezenProduct: ToegewezenProduct | null;
}

export interface Beschikking {
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
  /** Some kind of code followed by a file extension. Example: `"BR3400279.pdf"` */
  bestandsnaam: string;
}

export interface ZorgnedDocumentData {
  data: Buffer;
  mimetype: string;
  title: string;
}

type ZorgnedProcesAanvraagActieSource = {
  omschrijving: string;
  status: {
    identificatie: string;
    omschrijving: string;
  };
  datum: string;
};

export type ZorgnedProcesAanvraagSource = {
  identificatie: ZorgnedAanvraagSource['identificatie']; // Is equal to ZorgnedAanvraagSource identificatie
  omschrijving: string;
  datumStart: string;
  datumAfsluiten: string | null;
  acties?: ZorgnedProcesAanvraagActieSource[];
};

export interface ZorgnedAanvraagSource {
  beschikking: Beschikking;
  datumAanvraag: string;
  // The following field seems to be always defined for RTM type aanvragen.
  procesAanvraag?: ZorgnedProcesAanvraag;
  procesMelding?: ZorgnedProcesMelding;
  documenten: ZorgnedDocument[];
  identificatie: string;
  procesIdentificatie: string;
  casusIdentificatie: CasusIdentificatie | null;
}

export type ZorgnedProcesMelding = {
  identificatie: string;
  omschrijving: string;
  datumStart: string;
  datumAfsluiten: string;
  redenAfsluiten: { omschrijving: string } | null;
  omschrijvingAfsluiten: string;
};

export type ZorgnedProcesAanvraag = {
  identificatie: ZorgnedAanvraagSource['identificatie']; // Is equal to ZorgnedAanvraagSource identificatie
  omschrijving: string;
  datumStart: string;
};

export interface ZorgnedResponseDataSource {
  _embedded: { aanvraag: ZorgnedAanvraagSource[] };
}

export type ZorgnedProcesAanvraagActieTransformed = {
  omschrijving: ZorgnedProcesAanvraagActieSource['omschrijving'];
  status: ZorgnedProcesAanvraagActieSource['status']['omschrijving'];
  datum: ZorgnedProcesAanvraagActieSource['datum'];
};

export type ZorgnedProcesAanvraagTransformed = {
  identificatie: ZorgnedProcesAanvraagSource['identificatie'];
  omschrijving: ZorgnedProcesAanvraagSource['omschrijving'];
  datumStart: ZorgnedProcesAanvraagSource['datumStart'];
  datumAfsluiten: ZorgnedProcesAanvraagSource['datumAfsluiten'];
  acties: ZorgnedProcesAanvraagActieTransformed[];
};

export interface ZorgnedAanvraagTransformed {
  beschikkingNummer: number | null;
  beschiktProductIdentificatie: BeschiktProduct['identificatie'] | null;
  betrokkenen: string[];
  datumAanvraag: string;
  datumBeginLevering: string | null;
  datumBesluit: string | null;
  datumEindeGeldigheid: string | null;
  datumEindeLevering: string | null;
  datumIngangGeldigheid: string | null;
  datumOpdrachtLevering: string | null;
  datumToewijzing: string | null;
  procesAanvraagOmschrijving: string | null;
  documenten: GenericDocument[];
  id: string;
  isActueel: boolean;
  leverancier: string | null;
  leverancierIdentificatie: string | null;
  leveringsVorm: LeveringsVorm | null;
  prettyID: string;
  procesAanvraag: ZorgnedProcesAanvraagTransformed | null;
  procesIdentificatie: string;
  procesMeldingIdentificatie: string | null;
  isActueel: boolean;
  leverancier: string;
  leverancierIdentificatie: string;
  leveringsVorm: LeveringsVormTransformed;
  productsoortCode: ProductSoortCode | null;
  productIdentificatie?: ProductIdentificatie | null;
  beschiktProductIdentificatie: BeschiktProduct['identificatie'];
  beschikkingNummer: number | null;
  resultaat: BeschikkingsResultaat | null;
  titel: string | null;
};

export interface ZorgnedAanvraagWithRelatedPersonsTransformed extends ZorgnedAanvraagTransformed {
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

export type ZorgnedPersoonSource = {
  bsn: string;
  clientidentificatie: number | null;
  geboortenaam: string;
  roepnaam: string | null;
  voorletters: string;
  voornamen?: string | null;
  voorvoegsel: string | null;
  geboortedatum: string | null;
  partnernaam?: string | null;
  partnervoorvoegsel?: string | null;
};

export interface ZorgnedPersoonsgegevensNAWResponse {
  persoon?: ZorgnedPersoonSource;
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
  | 'ZORGNED_WMO'
  | 'ZORGNED_AV'
  | 'ZORGNED_LEERLINGENVERVOER';

export interface ZorgnedAanvragenServiceOptions {
  dataRequestConfig: DataRequestConfig;
  requestBodyParams?: Record<string, string>;
}

export type BSN = AuthProfile['id'];
