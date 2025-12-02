import { HttpStatusCode } from 'axios';
import { firstBy } from 'thenby';

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
  type Beschikking,
  type BSN,
  type ZorgnedAanvraagSource,
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
import { hash, sortAlpha, uniqueArray } from '../../../universal/helpers/utils';
import { GenericDocument } from '../../../universal/types/App.types';
import { getApiConfig } from '../../helpers/source-api-helpers';
import { isSuccessStatus, requestData } from '../../helpers/source-api-request';

async function fetchZorgnedByBSN<S, T>(
  bsn: BSN,
  options: ZorgnedAanvragenServiceOptions & {
    path: string;
    transform?: (response: S) => T;
    validateStatus?: (statusCode: number) => boolean;
    useCache?: boolean;
  }
): Promise<ApiResponse<T>> {
  const postBody = {
    ...(options.requestBodyParams ?? {}),
    burgerservicenummer: bsn,
    gemeentecode: ZORGNED_GEMEENTE_CODE,
  };

  const dataRequestConfig = getApiConfig(options.zorgnedApiConfigKey);
  const url = dataRequestConfig.url + options.path;

  const dataRequestConfig_ = {
    ...dataRequestConfig,
    url,
    data: postBody,
    transformResponse: options.transform,
    validateStatus: options.validateStatus,
  };

  if (typeof options.useCache !== 'undefined') {
    dataRequestConfig_.enableCache = options.useCache;
  }

  const zorgnedResponse = await requestData<T>(dataRequestConfig_);

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
    if (document.bestandsnaam) {
      doc.filename = document.bestandsnaam;
    }

    documents.push(doc);
  }

  return documents;
}

export function getZorgnedAanvraagID(
  beschikkingNummer: number,
  aanvraagIdentificatie: string,
  doHash: boolean = true
): string {
  const id = `${beschikkingNummer}-${aanvraagIdentificatie}`;
  return doHash ? hash(id) : id;
}

function transformZorgnedAanvraag(
  aanvraag: ZorgnedAanvraagSource,
  beschikking: Beschikking,
  beschiktProduct: BeschiktProduct
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
    id: getZorgnedAanvraagID(
      beschikking.beschikkingNummer,
      beschiktProduct.identificatie,
      false
    ),
    prettyID: getZorgnedAanvraagID(
      beschikking.beschikkingNummer,
      beschiktProduct.identificatie,
      false
    ),
    datumAanvraag: aanvraag.datumAanvraag,
    datumBeginLevering: levering?.begindatum ?? null,
    datumBesluit: aanvraag.beschikking.datumAfgifte ?? '', // See bug: MIJN-11809
    datumEindeGeldigheid: toegewezenProduct?.datumEindeGeldigheid ?? null,
    datumEindeLevering: levering?.einddatum ?? null,
    datumIngangGeldigheid: toegewezenProduct?.datumIngangGeldigheid ?? null,
    datumOpdrachtLevering: toewijzing?.datumOpdracht ?? null,
    datumToewijzing: toewijzing?.toewijzingsDatumTijd ?? null,
    procesAanvraagOmschrijving: aanvraag.procesAanvraag?.omschrijving ?? null,
    documenten: transformDocumenten(aanvraag.documenten ?? []),
    isActueel: toegewezenProduct?.actueel ?? false,
    leverancier: toegewezenProduct?.leverancier?.omschrijving ?? '',
    leveringsVorm,
    productsoortCode: productsoortCode,
    productIdentificatie,
    beschiktProductIdentificatie: beschiktProduct.identificatie,
    beschikkingNummer: aanvraag.beschikking.beschikkingNummer,
    resultaat: beschiktProduct.resultaat,
    titel: beschiktProduct.product.omschrijving ?? '',
    betrokkenen: toegewezenProduct?.betrokkenen ?? [],
  };

  return aanvraagTransformed;
}

export function sortZorgnedAanvragenByDateAndId<T extends object>(
  aanvragen: T[],
  dateKey: keyof T,
  idKey: keyof T
) {
  return aanvragen.toSorted(
    firstBy(dateSort(dateKey, 'desc')).thenBy(sortAlpha(idKey, 'desc'))
  );
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

    const beschikteProducten = beschikking.beschikteProducten;

    if (!beschikteProducten) {
      continue;
    }

    for (const beschiktProduct of beschikteProducten) {
      if (beschiktProduct) {
        const aanvraagTransformed = transformZorgnedAanvraag(
          aanvraagSource,
          beschikking,
          beschiktProduct
        );

        if (aanvraagTransformed) {
          aanvragenTransformed.push(aanvraagTransformed);
        }
      }
    }
  }

  return sortZorgnedAanvragenByDateAndId(
    aanvragenTransformed,
    'datumAanvraag',
    'prettyID'
  );
}

export async function fetchAllDocumentsRaw(
  bsn: BSN,
  options: ZorgnedAanvragenServiceOptions
) {
  return fetchZorgnedByBSN(bsn, {
    ...options,
    path: '/documenten',
    useCache: false,
  });
}

const FAKE_CASUS_ID = 'casus-id-not-set';

function transformCasusAanvragen(responseData: ZorgnedResponseDataSource) {
  const aanvragenSource = responseData?._embedded?.aanvraag ?? [];
  const aanvragenByCasusID = aanvragenSource.reduce(
    (acc, aanvraag) => {
      const casusID = aanvraag.casusIdentificatie || FAKE_CASUS_ID;

      if (!acc[casusID]) {
        acc[casusID] = {
          aanvragen: [],
          documenten: [],
        };
      }

      const documenten = aanvraag.documenten ?? [];
      acc[casusID].documenten.push(...documenten);
      acc[casusID].aanvragen.push(aanvraag);

      return acc;
    },
    {} as Record<
      string,
      { aanvragen: ZorgnedAanvraagSource[]; documenten: ZorgnedDocument[] }
    >
  );

  const casusAanvragen: ZorgnedAanvraagSource[] = [];

  for (const [casusID, { aanvragen, documenten }] of Object.entries(
    aanvragenByCasusID
  )) {
    const aanvragenWithBeschiktProduct = aanvragen.filter((aanvraag) => {
      return aanvraag.beschikking?.beschikteProducten?.length > 0;
    });

    const beschiktProductIds = uniqueArray(
      aanvragenWithBeschiktProduct.flatMap(
        (aanvraag) =>
          aanvraag.beschikking?.beschikteProducten?.map(
            (bp) => bp.identificatie
          ) || []
      )
    );

    // Take only the aanvragen that have only one beschikt product assigned within the whole Casus. Multiple aanvragen can have the same beschikt product.
    // Consolidate all documents from these aanvragen (regardless of beschiktProduct presence) into a single aanvraag.
    // This ensures that documents related to the same Casus, which might otherwise be hidden, are displayed to the user.
    // This approach is not applicable for aanvragen with multiple beschikte producten within the same Casus,
    // as documents cannot be reliably associated in such cases due to the absence of a beschikt product identifier in the documents.
    if (
      casusID !== FAKE_CASUS_ID &&
      // All aanvragen in a Casus must have only one beschikt product assigned.
      beschiktProductIds.length === 1 &&
      // Only consolidate if there are multiple aanvragen (with or without beschiktProduct) in this casus.
      aanvragen.length > 1
    ) {
      // Get the reference to the designated aanvraag and add the documents.
      const [id] = beschiktProductIds;
      const aanvraagWithAddedDocuments = {
        ...aanvragenWithBeschiktProduct[0],
        documenten: documenten.toSorted(dateSort('datumDefinitief', 'desc')),
      };
      casusAanvragen.push(
        // There can be more than one aanvraag with the same beschikt product id within the same casus.
        // This happens for example when a beëindingsproces is started that applies to an existing beschikt product.
        // In this case we have 2 aanvragen with the same beschikt product id. We need to add the same documenten to both aanvragen to be consistent.
        ...aanvragen.map((aanvraag) => {
          if (
            aanvraag.beschikking?.beschikteProducten?.[0]?.identificatie === id
          ) {
            return aanvraagWithAddedDocuments;
          }
          return aanvraag;
        })
      );
      continue;
    }

    casusAanvragen.push(...aanvragen);
  }

  return transformZorgnedAanvragen({
    _embedded: { aanvraag: casusAanvragen },
  });
}

export async function fetchCasusAanvragen(
  bsn: BSN,
  options: ZorgnedAanvragenServiceOptions
) {
  return fetchZorgnedByBSN(bsn, {
    ...options,
    path: '/aanvragen',
    transform: transformCasusAanvragen,
  });
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

export async function fetchAanvragenRaw(
  bsn: BSN,
  options: ZorgnedAanvragenServiceOptions
) {
  return fetchZorgnedByBSN(bsn, {
    ...options,
    path: '/aanvragen',
    useCache: false,
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
    [...bsns, bsnAanvrager],
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
  const persons: ZorgnedPerson[] = [];

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
    persons.push(person);
  }

  return apiSuccessResult(persons);
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
  transformCasusAanvragen,
  transformZorgnedPersonResponse,
  fetchAanvragen,
  fetchDocument,
};
