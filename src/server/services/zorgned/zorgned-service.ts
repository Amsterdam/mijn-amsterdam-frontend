import memoizee from 'memoizee';
import {
  apiErrorResult,
  apiSuccessResult,
  getSettledResult,
} from '../../../universal/helpers/api';
import { getFullName } from '../../../universal/helpers/brp';
import { dateSort, defaultDateFormat } from '../../../universal/helpers/date';
import { hash } from '../../../universal/helpers/utils';
import { GenericDocument } from '../../../universal/types';
import { getApiConfig, ONE_SECOND_MS } from '../../config';
import { AuthProfileAndToken } from '../../helpers/app';
import { requestData } from '../../helpers/source-api-request';
import { DocumentDownloadData } from '../shared/document-download-route-handler';
import {
  BeschiktProduct,
  LeveringsVorm,
  ZORGNED_GEMEENTE_CODE,
  ZorgnedAanvraagTransformed,
  ZorgnedDocument,
  ZorgnedDocumentResponseSource,
  ZorgnedPerson,
  ZorgnedPersoonsgegevensNAWResponse,
  ZorgnedResponseDataSource,
} from './zorgned-types';

function transformDocumenten(documenten: ZorgnedDocument[]) {
  const documents: GenericDocument[] = [];
  const definitieveDocumenten = documenten
    .filter((document) => !!document.datumDefinitief)
    .sort(dateSort('datumDefinitief', 'desc'));

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
    datumToewijzing: toewijzing?.toewijzingsDatumTijd ?? null,
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
  requestID: RequestID,
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
  requestID: RequestID,
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
  requestID: RequestID,
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

function transformZorgnedPersonResponse(
  zorgnedResponseData: ZorgnedPersoonsgegevensNAWResponse
): ZorgnedPerson | null {
  if (zorgnedResponseData?.persoon) {
    return {
      name:
        zorgnedResponseData?.persoon?.voornamen ??
        getFullName({
          voornamen: zorgnedResponseData?.persoon?.voornamen,
          geslachtsnaam: zorgnedResponseData?.persoon?.geboortenaam,
          voorvoegselGeslachtsnaam: zorgnedResponseData?.persoon?.voorvoegsel,
        }),
      dateOfBirth: zorgnedResponseData.persoon.geboortedatum,
      dateOfBirthFormatted: zorgnedResponseData.persoon.geboortedatum
        ? defaultDateFormat(zorgnedResponseData.persoon.geboortedatum)
        : null,
    };
  }
  return null;
}

export async function fetchRelatedPersons_(
  requestID: requestID,
  userIDs: string[]
) {
  const requests = userIDs.map((userID) => {
    return fetchPersoonsgegevensNAW(requestID, userID, 'ZORGNED_AV');
  });

  const results = await Promise.allSettled(requests);
  const namesAndDatesOfBirth: ZorgnedPerson[] = [];

  for (const result of results) {
    const response = getSettledResult(result);
    const person =
      response.status === 'OK'
        ? transformZorgnedPersonResponse(response.content)
        : null;
    if (person) {
      namesAndDatesOfBirth.push(person);
    } else {
      return apiErrorResult(
        'Something went wrong when retrieving names of betrokkenen.',
        null
      );
    }
  }

  return apiSuccessResult(namesAndDatesOfBirth);
}

export const fetchRelatedPersons = memoizee(fetchRelatedPersons_, {
  length: 3,
  maxAge: 45 * ONE_SECOND_MS,
});

export async function fetchPersoonsgegevensNAW_(
  requestID: RequestID,
  userID: AuthProfileAndToken['profile']['id'],
  zorgnedApiConfigKey: 'ZORGNED_JZD' | 'ZORGNED_AV'
) {
  const dataRequestConfig = getApiConfig(zorgnedApiConfigKey, {
    formatUrl(requestConfig) {
      return `${requestConfig.url}/persoonsgegevensNAW`;
    },
    data: {
      burgerservicenummer: userID,
      gemeentecode: ZORGNED_GEMEENTE_CODE,
    },
  });

  const response = requestData<ZorgnedPersoonsgegevensNAWResponse>(
    dataRequestConfig,
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
  transformZorgnedPersonResponse,
  fetchAanvragen,
  fetchDocument,
};
