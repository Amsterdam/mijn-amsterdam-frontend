import { apiErrorResult, hash } from '../../../universal/helpers';
import {
  BeschiktProduct,
  LeveringsVorm,
  ZORGNED_GEMEENTE_CODE,
  ZorgnedAanvraagTransformed,
  ZorgnedDocument,
  ZorgnedDocumentData,
  ZorgnedResponseDataSource,
} from './zorgned-config-and-types';

import { decrypt } from '../../../universal/helpers/encrypt-decrypt';
import { GenericDocument } from '../../../universal/types';
import { getApiConfig } from '../../config';
import { requestData } from '../../helpers';
import { AuthProfileAndToken } from '../../helpers/app';
import { captureException } from '../monitoring';
import { FeatureToggle } from '../../../universal/config';

function transformDocumenten(documenten: ZorgnedDocument[]) {
  const documents: GenericDocument[] = [];
  const definitieveDocumenten = documenten.filter(
    (document) => !!document.datumDefinitief
  );
  for (const document of definitieveDocumenten) {
    const doc: GenericDocument = {
      id: document.documentidentificatie,
      title: document.omschrijving,
      url: '', // NOTE: URL added later (wmo.ts > encryptDocumentIds) because we need an ecrypted id with specific session id.
      datePublished: document.datumDefinitief!, // definitieveDocumenten is filtered by checking the existance of this property.
    };
    documents.push(doc);
  }

  return documents;
}

function transformZorgnedAanvraag(
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

  const aanvraagTransformed: ZorgnedAanvraagTransformed = {
    id,
    datumAanvraag: datumAanvraag,
    datumBeginLevering: levering?.begindatum ?? '',
    datumBesluit: datumBesluit,
    datumEindeGeldigheid: toegewezenProduct.datumEindeGeldigheid,
    datumEindeLevering: levering?.einddatum ?? '',
    datumIngangGeldigheid: toegewezenProduct.datumIngangGeldigheid,
    datumOpdrachtLevering: toewijzing?.datumOpdracht ?? '',
    documenten: transformDocumenten(documenten),
    isActueel: toegewezenProduct.actueel,
    leverancier: toegewezenProduct?.leverancier?.omschrijving ?? '',
    leveringsVorm,
    productsoortCode: productsoortCode,
    resultaat: beschiktProduct.resultaat,
    titel: beschiktProduct.product.omschrijving ?? '',
    ontvanger: '--NAAM-ONTVANGER--',
  };

  return aanvraagTransformed;
}

export function transformZorgnedAanvragen(
  responseData: ZorgnedResponseDataSource
) {
  console.log(JSON.stringify(responseData));
  const aanvragenSource = responseData?._embedded?.aanvraag ?? [];

  const aanvragenTransformed: ZorgnedAanvraagTransformed[] = [];

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
      if (beschiktProduct) {
        // NOTE: Using index here because at least test data has duplicate entries with these exact properties.
        const idGenerated = hash(
          `${index}-${aanvraagSource.identificatie}-${beschikking.beschikkingNummer}-${datumBesluit}`
        );
        const aanvraagTransformed = transformZorgnedAanvraag(
          idGenerated,
          datumAanvraag,
          datumBesluit,
          beschiktProduct,
          documenten
        );
        if (aanvraagTransformed) {
          aanvragenTransformed.push(aanvraagTransformed);
        }
      }
    }
  }

  return aanvragenTransformed;
}

export async function fetchAanvragen(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken,
  zorgnedApiConfigKey: 'ZORGNED_JZD' | 'ZORGNED_AV',
  requestBodyParams?: Record<string, string>
) {
  const postBody = {
    ...requestBodyParams,
    burgerservicenummer: authProfileAndToken.profile.id,
    gemeentecode: ZORGNED_GEMEENTE_CODE,
  };

  const dataRequestConfig = getApiConfig(
    zorgnedApiConfigKey,
    zorgnedApiConfigKey === 'ZORGNED_AV'
      ? {
          postponeFetch: FeatureToggle.hliThemaActive,
        }
      : {}
  );

  const url = `${dataRequestConfig.url}/aanvragen`;

  const voorzieningen = await requestData<ZorgnedAanvraagTransformed[]>(
    {
      ...dataRequestConfig,
      url,
      data: postBody,
      transformResponse: transformZorgnedAanvragen,
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

  const dataRequestConfig = getApiConfig('ZORGNED_JZD');
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
  transformDocumenten,
  transformZorgnedAanvraag,
  transformZorgnedAanvragen,
  fetchAanvragen,
  fetchDocument,
};
