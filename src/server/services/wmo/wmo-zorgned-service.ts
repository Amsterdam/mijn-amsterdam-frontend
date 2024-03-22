import { FeatureToggle } from '../../../universal/config';
import { dateSort, hash, isDateInPast } from '../../../universal/helpers';
import { decrypt, encrypt } from '../../../universal/helpers/encrypt-decrypt';
import { GenericDocument } from '../../../universal/types';
import { getApiConfig } from '../../config';
import { requestData } from '../../helpers';
import { AuthProfileAndToken } from '../../helpers/app';
import {
  BESCHIKTPRODUCT_RESULTAAT,
  BeschiktProduct,
  DATE_END_NOT_OLDER_THAN,
  LeveringsVorm,
  MINIMUM_REQUEST_DATE_FOR_DOCUMENTS,
  PRODUCTS_WITH_DELIVERY,
  REGELING_IDENTIFICATIE,
  WMOAanvraag,
  WMOVoorziening,
  ZORGNED_GEMEENTE_CODE,
  ZorgnedDocument,
  ZorgnedDocumentData,
} from './config';

function isProductWithDelivery(
  wmoProduct: Pick<WMOVoorziening, 'productsoortCode' | 'leveringsVorm'>
) {
  const leveringsVorm = wmoProduct.leveringsVorm;
  const productsoortCode = wmoProduct.productsoortCode;

  // This check matches the products that should / can / will receive a delivery of goods / service / product(eventually).
  if (
    productsoortCode &&
    leveringsVorm &&
    leveringsVorm in PRODUCTS_WITH_DELIVERY
  ) {
    return productsoortCode in PRODUCTS_WITH_DELIVERY[leveringsVorm];
  }

  return false;
}

function transformDocumenten(documenten: ZorgnedDocument[]) {
  const documents: GenericDocument[] = [];

  for (const document of documenten) {
    const [idEncrypted] = encrypt(
      document.documentidentificatie,
      process.env.BFF_GENERAL_ENCRYPTION_KEY ?? ''
    );
    const doc = {
      id: idEncrypted,
      title: document.omschrijving,
      url: `/wmoned/document/${idEncrypted}`, // NOTE: Works with legacy relayApiUrl added in front-end. TODO: Remove relayApiUrl() concept.
      datePublished: document.datumDefinitief,
    };
    documents.push(doc);
  }

  return documents;
}

function transformAanvraagToVoorziening(
  id: string,
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
  const datumEindeGeldigheid = toegewezenProduct.datumEindeGeldigheid;
  const isEOG = !!datumEindeGeldigheid && isDateInPast(datumEindeGeldigheid); // is Einde Of Geldighed

  let isActueel = toegewezenProduct.actueel;
  let productsoortCode = beschiktProduct.product.productsoortCode;
  if (productsoortCode) {
    productsoortCode = productsoortCode.toUpperCase();
  }

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

  const voorziening: WMOVoorziening = {
    id,
    datumBeginLevering: levering?.begindatum ?? '',
    datumBesluit: datumBesluit,
    datumEindeGeldigheid: toegewezenProduct.datumEindeGeldigheid,
    datumEindeLevering: levering?.einddatum ?? '',
    datumIngangGeldigheid: toegewezenProduct.datumIngangGeldigheid,
    datumOpdrachtLevering: toewijzing?.datumOpdracht ?? '',
    documenten: transformDocumenten(documenten),
    isActueel: isActueel,
    leverancier: toegewezenProduct?.leverancier?.omschrijving ?? '',
    leveringsVorm,
    productsoortCode: productsoortCode,
    titel: beschiktProduct.product.omschrijving ?? '',
  };

  return voorziening;
}

function transformAanvragenToVoorzieningen(responseData: {
  _embedded: { aanvraag: WMOAanvraag[] };
}) {
  const aanvragenSource = responseData?._embedded?.aanvraag ?? [];

  const voorzieningen: WMOVoorziening[] = [];

  for (const aanvraagSource of aanvragenSource) {
    const beschikking = aanvraagSource.beschikking;
    const dateRequest = aanvraagSource.datumAanvraag;

    const datumBesluit = beschikking.datumAfgifte;
    const beschikteProducten = beschikking.beschikteProducten;

    const shouldShowDocuments =
      new Date(dateRequest) >= MINIMUM_REQUEST_DATE_FOR_DOCUMENTS &&
      FeatureToggle.zorgnedDocumentAttachmentsActive;

    let documenten: ZorgnedDocument[] = [];

    if (shouldShowDocuments) {
      documenten = aanvraagSource.documenten ?? [];
      console.log(
        'has doc',
        aanvraagSource.beschikking.beschikteProducten[0].product.omschrijving
      );
    }

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
  const documentId = decrypt(documentIdEncrpted);
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
