import {
  BeschiktProduct,
  LeveringsVorm,
  ZORGNED_GEMEENTE_CODE,
  ZorgnedAanvraagTransformed,
  ZorgnedDocument,
  ZorgnedDocumentResponseSource,
  ZorgnedResponseDataSource,
} from './zorgned-config-and-types';

import { GenericDocument } from '../../../universal/types';
import { getApiConfig, ONE_SECOND_MS } from '../../config';

import memoizee from 'memoizee';
import { hash } from '../../../universal/helpers/utils';
import { AuthProfileAndToken } from '../../helpers/app';
import { requestData } from '../../helpers/source-api-request';
import { ZorgnedPersoonsgegevensNAWResponse } from '../hli/hli-regelingen-types';
import { DocumentDownloadData } from '../shared/document-download-route-handler';

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
  const toewijzingen = toegewezenProduct?.toewijzingen ?? [];
  const toewijzing = toewijzingen.pop();
  const leveringen = toewijzing?.leveringen ?? [];
  const levering = leveringen.pop();

  const leveringsVorm =
    (toegewezenProduct?.leveringsvorm?.toUpperCase() as LeveringsVorm) ?? '';

  let productsoortCode = beschiktProduct.product.productsoortCode;
  if (productsoortCode) {
    productsoortCode = productsoortCode.toUpperCase();
  }

  let productIdentificatie = beschiktProduct.product.identificatie;
  if (productIdentificatie) {
    productIdentificatie = productIdentificatie.toUpperCase();
  }

  const aanvraagTransformed: ZorgnedAanvraagTransformed = {
    id,
    datumAanvraag: datumAanvraag,
    datumBeginLevering: levering?.begindatum ?? null,
    datumBesluit: datumBesluit,
    datumEindeGeldigheid: toegewezenProduct?.datumEindeGeldigheid ?? null,
    datumEindeLevering: levering?.einddatum ?? null,
    datumIngangGeldigheid: toegewezenProduct?.datumIngangGeldigheid ?? null,
    datumOpdrachtLevering: toewijzing?.datumOpdracht ?? null,
    documenten: transformDocumenten(documenten),
    isActueel: toegewezenProduct?.actueel ?? false,
    leverancier: toegewezenProduct?.leverancier?.omschrijving ?? '',
    leveringsVorm,
    productsoortCode: productsoortCode,
    productIdentificatie: productIdentificatie,
    resultaat: beschiktProduct.resultaat,
    titel: beschiktProduct.product.omschrijving ?? '',
    betrokkenen: toegewezenProduct?.betrokkenen ?? [],
  };

  return aanvraagTransformed;
}

export function transformZorgnedAanvragen(
  responseData: ZorgnedResponseDataSource
) {
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

  const dataRequestConfig = getApiConfig(zorgnedApiConfigKey);
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
  zorgnedApiConfigKey: 'ZORGNED_JZD' | 'ZORGNED_AV',
  documentId: ZorgnedDocument['documentidentificatie']
) {
  const postBody = {
    burgerservicenummer: authProfileAndToken.profile.id,
    gemeentecode: ZORGNED_GEMEENTE_CODE,
    documentidentificatie: documentId,
  };

  const dataRequestConfig = getApiConfig(zorgnedApiConfigKey);
  const url = `${dataRequestConfig.url}/document`;

  return requestData<DocumentDownloadData>(
    {
      ...dataRequestConfig,
      url,
      data: postBody,
      transformResponse: (
        documentResponseData: ZorgnedDocumentResponseSource
      ) => {
        if (
          !documentResponseData ||
          typeof documentResponseData !== 'object' ||
          !('inhoud' in documentResponseData)
        ) {
          throw new Error(
            'Zorgned document download - no valid response data provided'
          );
        }
        const data = Buffer.from(documentResponseData.inhoud, 'base64');
        return {
          data,
          mimetype: documentResponseData.mimetype,
          filename: documentResponseData.omschrijving,
        };
      },
    },
    requestID,
    authProfileAndToken
  );
}

function transformZorgnedRelaties(responseData: any) {
  return responseData;
}

export async function fetchRelaties(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken,
  zorgnedApiConfigKey: 'ZORGNED_JZD' | 'ZORGNED_AV'
) {
  const postBody = {
    burgerservicenummer: authProfileAndToken.profile.id,
    gemeentecode: ZORGNED_GEMEENTE_CODE,
  };

  const dataRequestConfig = getApiConfig(zorgnedApiConfigKey);

  const url = `${dataRequestConfig.url}/relaties`;

  const relaties = await requestData<ZorgnedAanvraagTransformed[]>(
    {
      ...dataRequestConfig,
      url,
      data: postBody,
      transformResponse: transformZorgnedRelaties,
    },
    requestID,
    authProfileAndToken
  );

  return relaties;
}

export async function fetchPersoonsgegevensNAW_(
  requestID: requestID,
  userID: AuthProfileAndToken['profile']['id'],
  zorgnedApiConfigKey: 'ZORGNED_JZD' | 'ZORGNED_AV'
) {
  const dataRequestConfig = getApiConfig(zorgnedApiConfigKey);
  const url = `${dataRequestConfig.url}/persoonsgegevensNAW`;
  const postData = {
    burgerservicenummer: userID,
    gemeentecode: ZORGNED_GEMEENTE_CODE,
  };
  const response = requestData<ZorgnedPersoonsgegevensNAWResponse>(
    {
      ...dataRequestConfig,
      data: postData,
      url,
    },
    requestID
  );

  return response;
}

export const fetchPersoonsgegevensNAW = memoizee(fetchPersoonsgegevensNAW_, {
  length: 3,
  maxAge: 45 * ONE_SECOND_MS,
});

export const forTesting = {
  transformDocumenten,
  transformZorgnedAanvraag,
  transformZorgnedAanvragen,
  fetchAanvragen,
  fetchDocument,
};
