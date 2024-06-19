import { hash } from '../../../universal/helpers';
import {
  BeschiktProduct,
  LeveringsVorm,
  ZORGNED_GEMEENTE_CODE,
  ZorgnedAanvraagTransformed,
  ZorgnedDocument,
  ZorgnedDocumentData,
  ZorgnedResponseDataSource,
} from './zorgned-config-and-types';

import { GenericDocument } from '../../../universal/types';
import { IS_DEBUG, getApiConfig } from '../../config';
import { requestData } from '../../helpers';
import { AuthProfileAndToken } from '../../helpers/app';
import { ZorgnedPersoonsgegevensNAWResponse } from '../hli/regelingen-types';

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
    betrokkenen: toegewezenProduct?.betrokkenen ?? [],
  };

  return aanvraagTransformed;
}

export function transformZorgnedAanvragen(
  responseData: ZorgnedResponseDataSource
) {
  console.log('zorgned', JSON.stringify(responseData, null, '  '));
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

function transformZorgnedRelaties(responseData: any) {
  console.dir(responseData);
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

export async function fetchPersoonsgegevensNAW(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken,
  zorgnedApiConfigKey: 'ZORGNED_JZD' | 'ZORGNED_AV'
) {
  const dataRequestConfig = getApiConfig(zorgnedApiConfigKey);
  const url = `${dataRequestConfig.url}/persoonsgegevensNAW`;
  const postData = {
    burgerservicenummer: authProfileAndToken.profile.id,
    gemeentecode: ZORGNED_GEMEENTE_CODE,
  };
  const response = requestData<ZorgnedPersoonsgegevensNAWResponse>(
    {
      ...dataRequestConfig,
      data: postData,
      url,
    },
    requestID,
    authProfileAndToken
  );

  return response;
}

export const forTesting = {
  transformDocumenten,
  transformZorgnedAanvraag,
  transformZorgnedAanvragen,
  fetchAanvragen,
  fetchDocument,
};
