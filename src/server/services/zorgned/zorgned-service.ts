import { HttpStatusCode } from 'axios';
import memoizee from 'memoizee';

import {
  BeschiktProduct,
  LeveringsVorm,
  ZORGNED_GEMEENTE_CODE,
  ZorgnedAanvraagTransformed,
  ZorgnedAanvraagWithRelatedPersonsTransformed,
  ZorgnedAanvragenServiceOptions,
  ZorgnedApiConfigKey,
  ZorgnedDocument,
  ZorgnedDocumentResponseSource,
  ZorgnedPerson,
  ZorgnedPersoonsgegevensNAWResponse,
  ZorgnedResponseDataSource,
} from './zorgned-types';
import {
  apiErrorResult,
  ApiSuccessResponse,
  apiSuccessResult,
  getFailedDependencies,
  getSettledResult,
} from '../../../universal/helpers/api';
import { getFullName } from '../../../universal/helpers/brp';
import { dateSort, defaultDateFormat } from '../../../universal/helpers/date';
import { hash } from '../../../universal/helpers/utils';
import { GenericDocument } from '../../../universal/types/App.types';
import { AuthProfileAndToken } from '../../auth/auth-types';
import { DEFAULT_API_CACHE_TTL_MS } from '../../config/source-api';
import { getApiConfig } from '../../helpers/source-api-helpers';
import { isSuccessStatus, requestData } from '../../helpers/source-api-request';
import { DocumentDownloadData } from '../shared/document-download-route-handler';

function transformDocumenten(documenten: ZorgnedDocument[]) {
  const documents: GenericDocument[] = [];
  const definitieveDocumenten = documenten
    .filter((document) => !!document.datumDefinitief)
    .sort(dateSort('datumDefinitief', 'desc'));

  for (const document of definitieveDocumenten) {
    const doc: GenericDocument = {
      id: document.documentidentificatie,
      title: document.omschrijvingclientportaal || document.omschrijving,
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
): ZorgnedAanvraagTransformed {
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
): ZorgnedAanvraagTransformed[] {
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

  return aanvragenTransformed.sort(dateSort('datumIngangGeldigheid', 'desc'));
}

export async function fetchAanvragen(
  authProfileAndToken: AuthProfileAndToken,
  options: ZorgnedAanvragenServiceOptions
) {
  const postBody = {
    ...(options.requestBodyParams ?? {}),
    burgerservicenummer: authProfileAndToken.profile.id,
    gemeentecode: ZORGNED_GEMEENTE_CODE,
  };

  const dataRequestConfig = getApiConfig(options.zorgnedApiConfigKey);
  const url = `${dataRequestConfig.url}/aanvragen`;

  const zorgnedAanvragenResponse = await requestData<
    ZorgnedAanvraagTransformed[]
  >(
    {
      ...dataRequestConfig,
      url,
      data: postBody,
      transformResponse: transformZorgnedAanvragen,
    },
    authProfileAndToken
  );

  return zorgnedAanvragenResponse;
}

export async function fetchAanvragenWithRelatedPersons(
  authProfileAndToken: AuthProfileAndToken,
  options: ZorgnedAanvragenServiceOptions
) {
  const zorgnedAanvragenResponse = await fetchAanvragen(
    authProfileAndToken,
    options
  );

  if (zorgnedAanvragenResponse.status === 'OK') {
    return fetchAndMergeRelatedPersons(zorgnedAanvragenResponse);
  }

  return zorgnedAanvragenResponse;
}

export async function fetchAndMergeRelatedPersons(
  zorgnedAanvragenResponse: ApiSuccessResponse<ZorgnedAanvraagTransformed[]>
): Promise<ApiSuccessResponse<ZorgnedAanvraagWithRelatedPersonsTransformed[]>> {
  const zorgnedAanvragenTransformed = zorgnedAanvragenResponse.content;

  const userIDs = zorgnedAanvragenTransformed.flatMap(
    (zorgnedAanvraagTransformed) => zorgnedAanvraagTransformed.betrokkenen
  );

  const relatedPersonsResponse = await fetchRelatedPersons(userIDs);

  const personsByUserId = relatedPersonsResponse.content?.reduce(
    (acc, person) => {
      acc[person.bsn] = person;
      return acc;
    },
    {} as Record<ZorgnedPerson['bsn'], ZorgnedPerson>
  );

  const zorgnedAanvragenWithRelatedPersons: ZorgnedAanvraagWithRelatedPersonsTransformed[] =
    zorgnedAanvragenTransformed.map((zorgnedAanvraagTransformed) => {
      let betrokkenPersonen: ZorgnedPerson[] = [];

      if (zorgnedAanvraagTransformed.betrokkenen?.length && personsByUserId) {
        betrokkenPersonen = zorgnedAanvraagTransformed.betrokkenen
          .map((userID) => personsByUserId[userID])
          .filter(Boolean);
      }

      return {
        ...zorgnedAanvraagTransformed,
        betrokkenPersonen,
      };
    });

  return apiSuccessResult(
    zorgnedAanvragenWithRelatedPersons,
    getFailedDependencies({
      relatedPersons: relatedPersonsResponse,
    })
  );
}

export async function fetchDocument(
  authProfileAndToken: AuthProfileAndToken,
  zorgnedApiConfigKey: ZorgnedApiConfigKey,
  documentId: ZorgnedDocument['documentidentificatie']
) {
  const postBody = {
    burgerservicenummer: authProfileAndToken.profile.id,
    gemeentecode: ZORGNED_GEMEENTE_CODE,
    documentidentificatie: documentId,
  };

  const dataRequestConfig = getApiConfig(zorgnedApiConfigKey);
  const url = `${dataRequestConfig.url}/document`;

  return requestData<DocumentDownloadData>({
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
        filename:
          documentResponseData.omschrijvingclientportaal ||
          documentResponseData.omschrijving,
      };
    },
  });
}

function transformZorgnedPersonResponse(
  zorgnedResponseData: ZorgnedPersoonsgegevensNAWResponse
): ZorgnedPerson | null {
  if (zorgnedResponseData?.persoon) {
    return {
      bsn: zorgnedResponseData.persoon.bsn,
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

export async function fetchRelatedPersons(userIDs: string[]) {
  const requests = userIDs.map((userID) => {
    return fetchPersoonsgegevensNAW(userID, 'ZORGNED_AV');
  });

  const results = await Promise.allSettled(requests);
  const namesAndDatesOfBirth: ZorgnedPerson[] = [];

  for (const result of results) {
    const response = getSettledResult(result);
    const person =
      response.status === 'OK'
        ? transformZorgnedPersonResponse(response.content)
        : null;
    if (!person) {
      return apiErrorResult(
        'Something went wrong when retrieving related persons.',
        null
      );
    }
    namesAndDatesOfBirth.push(person);
  }

  return apiSuccessResult(namesAndDatesOfBirth);
}

export async function fetchPersoonsgegevensNAW_(
  userID: AuthProfileAndToken['profile']['id'],
  zorgnedApiConfigKey: 'ZORGNED_JZD' | 'ZORGNED_AV'
) {
  const dataRequestConfig = getApiConfig(zorgnedApiConfigKey, {
    formatUrl(requestConfig) {
      return `${requestConfig.url}/persoonsgegevensNAW`;
    },
    validateStatus: (statusCode) =>
      // 404 means there is no record available in the ZORGNED api for the requested BSN
      isSuccessStatus(statusCode) || statusCode === HttpStatusCode.NotFound,
    data: {
      burgerservicenummer: userID,
      gemeentecode: ZORGNED_GEMEENTE_CODE,
    },
  });

  const response =
    requestData<ZorgnedPersoonsgegevensNAWResponse>(dataRequestConfig);

  return response;
}

export const fetchPersoonsgegevensNAW = memoizee(fetchPersoonsgegevensNAW_, {
  length: 3,
  maxAge: DEFAULT_API_CACHE_TTL_MS,
});

export const forTesting = {
  transformDocumenten,
  transformZorgnedAanvraag,
  transformZorgnedAanvragen,
  transformZorgnedPersonResponse,
  fetchAanvragen,
  fetchDocument,
};
