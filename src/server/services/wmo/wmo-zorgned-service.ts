import { apiErrorResult, hash, isDateInPast } from '../../../universal/helpers';
import { decrypt, encrypt } from '../../../universal/helpers/encrypt-decrypt';
import { GenericDocument } from '../../../universal/types';
import { getApiConfig } from '../../config';
import { requestData } from '../../helpers';
import { AuthProfileAndToken } from '../../helpers/app';
import { captureException } from '../monitoring';
import {
  BESCHIKTPRODUCT_RESULTAAT,
  BeschiktProduct,
  DATE_END_NOT_OLDER_THAN,
  Levering,
  LeveringsVorm,
  MINIMUM_REQUEST_DATE_FOR_DOCUMENTS,
  PRODUCTS_WITH_DELIVERY,
  ProductSoortCode,
  REGELING_IDENTIFICATIE,
  SINGLE_DOC_TITLE_BESLUIT,
  ToegewezenProduct,
  WMOSourceResponseData,
  WMOVoorziening,
  ZORGNED_GEMEENTE_CODE,
  ZorgnedDocument,
  ZorgnedDocumentData,
} from './wmo-config-and-types';
import { parseISO } from 'date-fns';

function isProductWithDelivery(
  wmoProduct: Pick<WMOVoorziening, 'productsoortCode' | 'leveringsVorm'>
) {
  const leveringsVorm = wmoProduct.leveringsVorm;
  const productsoortCode = wmoProduct.productsoortCode;

  // This check matches the products that should / can / will receive a delivery of goods / service / product(eventually).
  if (leveringsVorm in PRODUCTS_WITH_DELIVERY) {
    return PRODUCTS_WITH_DELIVERY[leveringsVorm].includes(productsoortCode);
  }

  return false;
}

function transformDocumenten(documenten: ZorgnedDocument[]) {
  const documents: GenericDocument[] = [];
  const definitieveDocumenten = documenten.filter(
    (document) => !!document.datumDefinitief
  );
  for (const document of definitieveDocumenten) {
    const doc = {
      id: document.documentidentificatie,
      title: SINGLE_DOC_TITLE_BESLUIT, // TODO: Change if we get proper document names from Zorgned api
      url: '', // NOTE: URL added later (wmo.ts > encryptDocumentIds) because we need an ecrypted id with specific session id.
      datePublished: document.datumDefinitief,
    };
    documents.push(doc);
  }

  return documents;
}

function isActual({
  toegewezenProduct,
  levering,
  productsoortCode,
  leveringsVorm,
}: {
  toegewezenProduct?: ToegewezenProduct;
  levering?: Levering;
  productsoortCode: ProductSoortCode;
  leveringsVorm: LeveringsVorm;
}) {
  const datumEindeGeldigheid = toegewezenProduct?.datumEindeGeldigheid;
  const isEOG = !!datumEindeGeldigheid && isDateInPast(datumEindeGeldigheid); // is Einde Of Geldighed

  let isActueel = !!toegewezenProduct?.actueel;
  // Override actueel indien er nog geen levering heeft plaatsgevonden en de geldigheid nog niet is afgelopen
  if (
    !isActueel &&
    !levering?.einddatum &&
    !levering?.begindatum &&
    !isEOG &&
    isProductWithDelivery({
      productsoortCode,
      leveringsVorm,
    })
  ) {
    isActueel = true;
  }
  // Override actueel indien de einde geldigheid is verlopen
  if (isActueel && isEOG) {
    isActueel = false;
  }

  return isActueel;
}

function transformAanvraagToVoorziening(
  id: string,
  datumAanvraag: string,
  datumBesluit: string,
  beschiktProduct: BeschiktProduct,
  documenten: ZorgnedDocument[]
) {
  const toegewezenProduct = beschiktProduct.toegewezenProduct;
  const toewijzingen = toegewezenProduct.toewijzingen ?? [];
  const toewijzing = toewijzingen.pop();
  const leveringen = toewijzing?.leveringen ?? [];
  const levering = leveringen.pop();

  const leveringsVorm =
    (toegewezenProduct?.leveringsvorm?.toUpperCase() as LeveringsVorm) ?? '';

  let productsoortCode = beschiktProduct.product.productsoortCode;
  if (productsoortCode) {
    productsoortCode = productsoortCode.toUpperCase();
  }

  const voorziening: WMOVoorziening = {
    id,
    datumAanvraag: datumAanvraag,
    datumBeginLevering: levering?.begindatum ?? '',
    datumBesluit: datumBesluit,
    datumEindeGeldigheid: toegewezenProduct.datumEindeGeldigheid,
    datumEindeLevering: levering?.einddatum ?? '',
    datumIngangGeldigheid: toegewezenProduct.datumIngangGeldigheid,
    datumOpdrachtLevering: toewijzing?.datumOpdracht ?? '',
    documenten:
      parseISO(datumAanvraag) < MINIMUM_REQUEST_DATE_FOR_DOCUMENTS
        ? []
        : transformDocumenten(documenten),
    isActueel: isActual({
      toegewezenProduct,
      levering,
      productsoortCode,
      leveringsVorm,
    }),
    leverancier: toegewezenProduct?.leverancier?.omschrijving ?? '',
    leveringsVorm,
    productsoortCode: productsoortCode,
    titel: beschiktProduct.product.omschrijving ?? '',
  };

  return voorziening;
}

function transformAanvragenToVoorzieningen(
  responseData: WMOSourceResponseData
) {
  const aanvragenSource = responseData?._embedded?.aanvraag ?? [];

  const voorzieningen: WMOVoorziening[] = [];

  for (const aanvraagSource of aanvragenSource) {
    const beschikking = aanvraagSource.beschikking;

    if (!beschikking) {
      continue;
    }

    const datumBesluit = beschikking.datumAfgifte;
    const datumAanvraag = aanvraagSource.datumAanvraag;
    const beschikteProducten = beschikking.beschikteProducten;

    if (!beschikteProducten) {
      continue;
    }

    const documenten: ZorgnedDocument[] = aanvraagSource.documenten ?? [];

    for (const [index, beschiktProduct] of beschikteProducten.entries()) {
      if (
        beschiktProduct &&
        datumBesluit &&
        BESCHIKTPRODUCT_RESULTAAT.includes(beschiktProduct.resultaat)
      ) {
        // NOTE: Using index here because at least test data has duplicate entries with these exact properties
        const idGenerated = hash(
          `${index}-${aanvraagSource.identificatie}-${beschikking.beschikkingNummer}-${datumBesluit}`
        );
        const voorziening = transformAanvraagToVoorziening(
          idGenerated,
          datumAanvraag,
          datumBesluit,
          beschiktProduct,
          documenten
        );
        if (voorziening) {
          voorzieningen.push(voorziening);
        }
      }
    }
  }

  return voorzieningen;
}

export async function fetchVoorzieningen(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const postBody = {
    burgerservicenummer: authProfileAndToken.profile.id,
    gemeentecode: ZORGNED_GEMEENTE_CODE,
    maxeinddatum: DATE_END_NOT_OLDER_THAN,
    regeling: REGELING_IDENTIFICATIE,
  };

  const dataRequestConfig = getApiConfig('ZORGNED');

  const url = `${dataRequestConfig.url}/aanvragen`;

  const voorzieningen = await requestData<WMOVoorziening[]>(
    {
      ...dataRequestConfig,
      url,
      data: postBody,
      transformResponse: transformAanvragenToVoorzieningen,
    },
    requestID,
    authProfileAndToken
  );

  return voorzieningen;
}

export async function fetchDocument(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken,
  documentIdEncrpted: ZorgnedDocument['documentidentificatie']
) {
  let documentId: string = '';
  let sessionID: string = '';
  try {
    [sessionID, documentId] = decrypt(documentIdEncrpted).split(':');
  } catch (error) {
    captureException(error);
  }

  if (!documentId || sessionID !== authProfileAndToken.profile.sid) {
    return apiErrorResult('Not authorized', null, 401);
  }

  const postBody = {
    burgerservicenummer: authProfileAndToken.profile.id,
    gemeentecode: ZORGNED_GEMEENTE_CODE,
    documentidentificatie: documentId,
  };

  const dataRequestConfig = getApiConfig('ZORGNED');
  const url = `${dataRequestConfig.url}/document`;

  return requestData<ZorgnedDocumentData>(
    {
      ...dataRequestConfig,
      url,
      data: postBody,
      transformResponse: (documentResponseData) => {
        if (documentResponseData) {
          const data = Buffer.from(documentResponseData.inhoud, 'base64');
          return {
            title: documentResponseData.omschrijving ?? 'Besluit',
            mimetype: documentResponseData.mimetype,
            data,
          };
        }
        throw new Error('No document content');
      },
    },
    requestID,
    authProfileAndToken
  );
}

export const forTesting = {
  isProductWithDelivery,
  transformDocumenten,
  isActual,
  transformAanvragenToVoorzieningen,
};
