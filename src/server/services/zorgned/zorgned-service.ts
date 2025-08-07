import { HttpStatusCode } from 'axios';

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
  type BSN,
} from './zorgned-types';
import {
  apiErrorResult,
  ApiSuccessResponse,
  apiSuccessResult,
  getFailedDependencies,
  getSettledResult,
  type ApiResponse,
} from '../../../universal/helpers/api';
import { getFullName } from '../../../universal/helpers/brp';
import { dateSort, defaultDateFormat } from '../../../universal/helpers/date';
import { sortByNumber, uniqueArray } from '../../../universal/helpers/utils';
import { GenericDocument } from '../../../universal/types/App.types';
import { getApiConfig } from '../../helpers/source-api-helpers';
import { isSuccessStatus, requestData } from '../../helpers/source-api-request';

async function fetchZorgnedByBSN<S, T>(
  bsn: BSN,
  options: ZorgnedAanvragenServiceOptions & {
    path: string;
    transform?: (response: S) => T;
    validateStatus?: (statusCode: number) => boolean;
  }
): Promise<ApiResponse<T>> {
  const postBody = {
    ...(options.requestBodyParams ?? {}),
    burgerservicenummer: bsn,
    gemeentecode: ZORGNED_GEMEENTE_CODE,
  };

  const dataRequestConfig = getApiConfig(options.zorgnedApiConfigKey);
  const url = dataRequestConfig.url + options.path;

  const zorgnedResponse = await requestData<T>({
    ...dataRequestConfig,
    url,
    data: postBody,
    transformResponse: options.transform,
    validateStatus: options.validateStatus,
  });

  return zorgnedResponse;
}

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
    beschiktProductIdentificatie: beschiktProduct.identificatie,
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

    const datumBesluit = beschikking.datumAfgifte ?? ''; // See bug: MIJN-11809
    const datumAanvraag = aanvraagSource.datumAanvraag;
    const beschikteProducten = beschikking.beschikteProducten;

    if (!beschikteProducten) {
      continue;
    }

    const documenten: ZorgnedDocument[] = aanvraagSource.documenten ?? [];

    for (const beschiktProduct of beschikteProducten) {
      if (beschiktProduct) {
        const aanvraagTransformed = transformZorgnedAanvraag(
          aanvraagSource.identificatie,
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

  return aanvragenTransformed.sort(sortByNumber('id', 'desc'));
}

export async function fetchAanvragen(
  bsn: BSN,
  options: ZorgnedAanvragenServiceOptions
) {
  return fetchZorgnedByBSN(bsn, {
    ...options,
    path: '/aanvragen',
    transform: transformZorgnedAanvragen,
  });
}

export async function fetchAndMergeRelatedPersons(
  bsnAanvrager: BSN,
  zorgnedApiConfigKey: ZorgnedApiConfigKey,
  zorgnedAanvragenResponse: ApiSuccessResponse<ZorgnedAanvraagTransformed[]>,
  partnernaam: string | null
): Promise<ApiSuccessResponse<ZorgnedAanvraagWithRelatedPersonsTransformed[]>> {
  const zorgnedAanvragenTransformed = zorgnedAanvragenResponse.content;

  const bsns = uniqueArray(
    zorgnedAanvragenTransformed.flatMap(
      (zorgnedAanvraagTransformed) => zorgnedAanvraagTransformed.betrokkenen
    )
  );

  const relatedPersonsResponse = await fetchRelatedPersons(
    bsns,
    zorgnedApiConfigKey
  );

  const personsByUserId = relatedPersonsResponse.content?.reduce(
    (acc, person_) => {
      const person = { ...person_ };

      if (person.name === partnernaam) {
        person.isPartner = true;
      }

      if (person.bsn === bsnAanvrager) {
        person.isAanvrager = true;
      }

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
        bsnAanvrager,
      };
    });

  return apiSuccessResult(
    zorgnedAanvragenWithRelatedPersons,
    getFailedDependencies({
      relatedPersons: relatedPersonsResponse,
    })
  );
}

export async function fetchAanvragenWithRelatedPersons(
  bsnAanvrager: BSN,
  options: ZorgnedAanvragenServiceOptions
): Promise<ApiResponse<ZorgnedAanvraagWithRelatedPersonsTransformed[]>> {
  const zorgnedAanvragenResponse = await fetchAanvragen(bsnAanvrager, options);

  if (zorgnedAanvragenResponse.status === 'OK') {
    const persoonsgegevensNAW = await fetchPersoonsgegevensNAW(
      bsnAanvrager,
      options.zorgnedApiConfigKey
    );

    return fetchAndMergeRelatedPersons(
      bsnAanvrager,
      options.zorgnedApiConfigKey,
      zorgnedAanvragenResponse,
      persoonsgegevensNAW.content?.persoon?.partnernaam ?? null
    );
  }

  return zorgnedAanvragenResponse;
}

function transformZorgnedDocumenten(
  documentResponseData: ZorgnedDocumentResponseSource
) {
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
}

export async function fetchDocument(
  bsn: BSN,
  zorgnedApiConfigKey: ZorgnedApiConfigKey,
  documentId: ZorgnedDocument['documentidentificatie']
) {
  const requestBodyParams = {
    documentidentificatie: documentId,
  };

  return fetchZorgnedByBSN(bsn, {
    path: '/document',
    zorgnedApiConfigKey,
    transform: transformZorgnedDocumenten,
    requestBodyParams,
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
      partnernaam: zorgnedResponseData.persoon?.partnernaam ?? null,
      partnervoorvoegsel:
        zorgnedResponseData.persoon.partnervoorvoegsel ?? null,
    };
  }
  return null;
}

export async function fetchRelatedPersons(
  bsn: BSN[],
  zorgnedApiConfigKey: ZorgnedApiConfigKey
) {
  const requests = bsn.map((userID) => {
    return fetchPersoonsgegevensNAW(userID, zorgnedApiConfigKey);
  });

  const results = await Promise.allSettled(requests);
  const namesAndDatesOfBirth: ZorgnedPerson[] = [];

  for (const result of results) {
    const response = getSettledResult(result);
    const person =
      response.status === 'OK' && response.content
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

export async function fetchPersoonsgegevensNAW(
  bsn: BSN,
  zorgnedApiConfigKey: ZorgnedApiConfigKey
): Promise<ApiResponse<ZorgnedPersoonsgegevensNAWResponse | null>> {
  return fetchZorgnedByBSN<
    ZorgnedPersoonsgegevensNAWResponse,
    ZorgnedPersoonsgegevensNAWResponse | null
  >(bsn, {
    zorgnedApiConfigKey,
    path: '/persoonsgegevensNAW',
    validateStatus: (statusCode) =>
      // 404 means there is no record available in the ZORGNED api for the requested BSN
      isSuccessStatus(statusCode) || statusCode === HttpStatusCode.NotFound,
    transform: (response: ZorgnedPersoonsgegevensNAWResponse) => {
      if (response?.persoon) {
        return response;
      }
      return null;
    },
  });
}

export const forTesting = {
  transformDocumenten,
  transformZorgnedAanvraag,
  transformZorgnedAanvragen,
  transformZorgnedPersonResponse,
  fetchAanvragen,
  fetchDocument,
};
