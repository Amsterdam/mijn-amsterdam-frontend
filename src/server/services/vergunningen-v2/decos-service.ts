import memoizee from 'memoizee';

import {
  AddressBookEntry,
  DecosDocumentBlobSource,
  DecosDocumentSource,
  DecosFieldValue,
  DecosWorkflowStepDate,
  DecosWorkflowStepTitle,
  DecosZaakSource,
  DecosZakenResponse,
  MA_DECISION_DEFAULT,
  VergunningDocument,
  VergunningV2,
  adresBoekenByProfileType,
} from './config-and-types';
import {
  SELECT_FIELDS_META,
  SELECT_FIELDS_TRANSFORM_BASE,
  decosZaakTransformers,
} from './decos-zaken';
import {
  getDecosZaakTypeFromSource,
  getUserKeysSearchQuery,
  isExcludedFromTransformation,
} from './helpers';
import {
  apiSuccessResult,
  getSettledResult,
} from '../../../universal/helpers/api';
import { sortAlpha, uniqueArray } from '../../../universal/helpers/utils';
import { AuthProfileAndToken } from '../../auth/auth-types';
import {
  DataRequestConfig,
  DEFAULT_API_CACHE_TTL_MS,
} from '../../config/source-api';
import { getApiConfig } from '../../helpers/source-api-helpers';
import { requestData } from '../../helpers/source-api-request';
import { captureException, captureMessage } from '../monitoring';
import { DocumentDownloadData } from '../shared/document-download-route-handler';
/**
 * The Decos service ties responses of various api calls together and produces a set of transformed set of vergunningen.
 *
 * Service: **fetchDecosVergunningen**
 *
 * First we query Decos for a `key` to see if a certain userID (BSN or KVKNUMBER) is known in the system. We look for the values of the userID in so called AddressBooks.
 * The id's (keys) of the addressbooks are static values. So we put together a search query that looks for an AddressBook entry in a
 * specic AddressBook table that matches a condition (num1 should be the userID)
 *
 * After querying the AddressBook we use the keys that were retrieved to look for Zaken tied to these AddressBookEntry keys.
 * Initially we only select a set of specific api attributes (fields) that we want to be processed/transformed. This reduces the response size and should be faster.
 *
 * After retrieving the zaken we first filter these zaken based on configuration found in `decos-zaken.ts`.
 * We check for data quality, payment and other arbitrary checks (hasValidSourceData).
 *
 * We now have filtered set of decos zaken which we want to make sense of first by transforming the api attributes to understandable
 * ones for example the source attribute `document_date` becomes `dateRequest`.
 *
 * After transformation of the api attribute names and possibly values we apply another, optional, transform to the data.
 * At this point we can fetch other services to enrich the data we retrieved initially or maybe assign values to some properties based on business logic.
 *
 * Service: **fetchDecosVergunning**
 *
 * Retrieves one zaak based on a key found in the fetchDecosVergunningen call. This service is used to provide the data for the detailed view of a vergunning.
 * This api call to Decos does not specify any fields to be selected and instead retrieves all the fields related to the requested zaak. Source validity checks / filtering is
 * not performed at this stage because we should only have the keys of individual zaken that we got from the fetchDecosVergunningen service.
 *
 * Event hough we retrieve all source fields/values for a specific case, only ones specified (transformFields) end up in the data sent to the user.
 *
 * Service: **fetchDecosWorkflowDate**
 *
 * Retrieves a date given to a certain workflow step based on the title of the step.
 *
 * Service: **fetchDecosDocumentList**
 *
 * Retrieves a list of document entries (not the document binary data) related to a specific zaak based on the zaakID (key). Note: zaakID and identifier are not the same thing.
 * ZaakID is the value of the `key` attribute in Decos. `Identifier` is the attribute name we use in Mijn Amsterdam as `Zaaknummer / Kenmerk`, a value readable to the user.
 *
 *
 * Servuce: **fetchDecosDocument**
 *
 * Retrieves the document (binary) data which can be presented to the user as Document download.
 *
 */

async function getUserKeys(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const apiConfig = getApiConfig('DECOS_API', {
    method: 'post',
    formatUrl: (config) => {
      return `${config.url}/search/books?properties=false&select=key`;
    },
    transformResponse: (responseData) => {
      return responseData?.itemDataResultSet?.content ?? [];
    },
  });

  const bookSearches = [];
  const adresBoeken =
    adresBoekenByProfileType[authProfileAndToken.profile.profileType];

  // First find user keys associated with the current user.id (bsn or kvk)
  for (const addressBookKey of adresBoeken) {
    const requestBody = getUserKeysSearchQuery(
      addressBookKey,
      authProfileAndToken.profile.id
    );
    const requestConfig = { ...apiConfig, data: requestBody };
    const request = requestData<AddressBookEntry[]>(requestConfig, requestID);

    bookSearches.push(request);
  }

  const bookSearchResponses = await Promise.all(bookSearches);

  const userKeys = [];

  for (const response of bookSearchResponses) {
    if (response.status === 'ERROR') {
      return response;
    }
    if (Array.isArray(response.content)) {
      userKeys.push(...response.content.map((record) => record.key));
    }
  }

  return apiSuccessResult(userKeys);
}

async function transformDecosZaakResponse(
  requestID: RequestID,
  decosZaakSource: DecosZaakSource
) {
  const zaakType = getDecosZaakTypeFromSource(decosZaakSource);
  const zaakTypeTransformer = decosZaakTransformers[zaakType];

  if (!zaakTypeTransformer || !zaakTypeTransformer.transformFields) {
    captureMessage(`No transformer for zaakType ${zaakType}`);
    return null;
  }

  if (isExcludedFromTransformation(decosZaakSource, zaakTypeTransformer)) {
    return null;
  }

  // Reference to decos workflow service for use in transformers
  const fetchWorkflowDate = (stepTitle: string) => {
    return fetchDecosWorkflowDate(requestID, decosZaakSource.key, stepTitle);
  };

  // Iterates over the desired data fields (key=>value pairs) and transforms values if necessary.
  const transformedFieldEntries = Object.entries(
    zaakTypeTransformer.transformFields
  ).map(([fieldNameSource, fieldTransformer]) => {
    const fieldNameTransformed =
      typeof fieldTransformer === 'object'
        ? fieldTransformer.name
        : fieldTransformer;

    const value = decosZaakSource.fields[fieldNameSource] ?? null;

    let nValue: DecosFieldValue = value;

    try {
      nValue =
        typeof fieldTransformer === 'object' &&
        typeof fieldTransformer.transform === 'function'
          ? fieldTransformer.transform(value, {
              zaakTypeTransformer,
              fetchDecosWorkflowDate: fetchWorkflowDate,
            })
          : value;
    } catch (err) {
      captureException(err);
    }

    return [fieldNameTransformed ?? fieldNameSource, nValue];
  });

  // Create an object from the transformed fieldNames and values
  const transformedFields = Object.fromEntries(transformedFieldEntries);

  // Create the base data for the vergunning. This object is not guaranteed to have all fields defined in the type for a specific vergunning.
  // It depends on the query and resturned result to the decos api which field value ends up in the vergunning.
  // For example, if we selected only the sourcefield `mark` we'd have a vergunning with a value for `identifier`..
  let vergunning: VergunningV2 = {
    id:
      transformedFields.identifier?.replace(/\//g, '-') ??
      'unknown-vergunning-id',
    key: decosZaakSource.key,
    title: zaakTypeTransformer.title,
    dateInBehandeling: null, // Serves as placeholder, value for this property will be added async below.
    ...transformedFields,
  };

  // Try to fetch and assign a specific date on which the zaak was "In behandeling"
  if (zaakTypeTransformer.dateInBehandelingWorkflowStepTitle) {
    const { content: dateInBehandeling } = await fetchWorkflowDate(
      zaakTypeTransformer.dateInBehandelingWorkflowStepTitle
    );
    if (dateInBehandeling) {
      vergunning.dateInBehandeling = dateInBehandeling;
    }
  }

  if (vergunning.processed && !vergunning.decision) {
    vergunning.decision = MA_DECISION_DEFAULT;
  }

  // After initial transformation of the data is done, perform a Post transform action.
  // It's possible to handle some data quality improvements and/or business logic operations in the after transform function.
  if (zaakTypeTransformer.afterTransform) {
    vergunning = await zaakTypeTransformer.afterTransform(
      vergunning,
      decosZaakSource,
      {
        fetchDecosWorkflowDate: fetchWorkflowDate,
        zaakTypeTransformer,
      }
    );
  }

  return vergunning;
}

async function transformDecosZakenResponse(
  requestID: RequestID,
  decosZakenSource: DecosZaakSource[]
) {
  const zakenToBeTransformed = [];

  for (const decosZaakSource of decosZakenSource) {
    const zaakType = getDecosZaakTypeFromSource(decosZaakSource);
    const zaakTypeTransformer = decosZaakTransformers[zaakType];

    if (!zaakTypeTransformer) {
      captureMessage(`Decos: ${zaakType} transformer not implemented`);
      continue;
    }

    // Exclude zaken that match the following conditions
    if (isExcludedFromTransformation(decosZaakSource, zaakTypeTransformer)) {
      continue;
    }

    zakenToBeTransformed.push(decosZaakSource);
  }

  let vergunningen: Array<VergunningV2 | null> = [];

  try {
    vergunningen = await Promise.all(
      zakenToBeTransformed.map((decosZaak) => {
        return transformDecosZaakResponse(requestID, decosZaak);
      })
    );
  } catch (err) {
    captureException(err);
  }

  return vergunningen
    .filter(
      (vergunning: VergunningV2 | null): vergunning is VergunningV2 =>
        vergunning !== null
    )
    .sort(sortAlpha('identifier', 'desc'));
}

async function getZakenByUserKey(requestID: RequestID, userKey: string) {
  const selectFieldsAllCases = Object.keys(SELECT_FIELDS_TRANSFORM_BASE);
  const additionalSelectFields = Object.values(decosZaakTransformers).flatMap(
    (zaakTransformer) => zaakTransformer.addToSelectFieldsBase ?? []
  );

  const selectFields = uniqueArray([
    ...SELECT_FIELDS_META,
    ...selectFieldsAllCases,
    ...additionalSelectFields,
  ]).join(',');

  const apiConfig = getApiConfig('DECOS_API', {
    formatUrl: (config) => {
      return `${config.url}/items/${userKey}/folders?top=50&select=${selectFields}`;
    },
    transformResponse: (responseData: DecosZakenResponse) => {
      if (!Array.isArray(responseData?.content)) {
        return [];
      }
      return responseData.content;
    },
  });

  const responseSource = await requestData<DecosZaakSource[]>(
    apiConfig,
    requestID
  );

  return responseSource;
}

export async function fetchDecosZakenFromSource(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const userKeysResponse = await getUserKeys(requestID, authProfileAndToken);

  if (userKeysResponse.status === 'ERROR') {
    return userKeysResponse;
  }

  const zakenSourceResponses = await Promise.allSettled(
    userKeysResponse.content.map((userKey) =>
      getZakenByUserKey(requestID, userKey)
    )
  );

  const zakenSource = [];

  for (const decosZakenSource of zakenSourceResponses) {
    const response = getSettledResult(decosZakenSource);

    if (response.status === 'OK') {
      zakenSource.push(...response.content);
    } else if (response.status === 'ERROR') {
      return response;
    }
  }

  return apiSuccessResult(zakenSource);
}

async function fetchDecosVergunningen_(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const zakenSourceResponse = await fetchDecosZakenFromSource(
    requestID,
    authProfileAndToken
  );

  if (zakenSourceResponse.status === 'OK') {
    const vergunningen = await transformDecosZakenResponse(
      requestID,
      zakenSourceResponse.content
    );

    return apiSuccessResult(vergunningen);
  }

  return zakenSourceResponse;
}

export const fetchDecosVergunningen = memoizee(fetchDecosVergunningen_, {
  maxAge: DEFAULT_API_CACHE_TTL_MS,
});

function transformDecosWorkflowKeysResponse(workflowsResponseData: {
  content: Array<{ key: string }>;
}) {
  if (workflowsResponseData?.content?.length) {
    const lastKey = workflowsResponseData.content.pop();
    return lastKey?.key ?? null;
  }
  return null;
}

function transformDecosWorkflowDateResponse(
  stepTitle: DecosWorkflowStepTitle,
  singleWorkflowResponseData: {
    content: Array<{ fields: { text7: string; date1?: string } }>;
  }
) {
  return (
    singleWorkflowResponseData.content?.find((workflowStep) => {
      return workflowStep.fields.text7 === stepTitle;
    })?.fields.date1 ?? null
  );
}

export async function fetchDecosWorkflowDate(
  requestID: RequestID,
  zaakID: VergunningV2['key'],
  stepTitle: DecosWorkflowStepTitle
) {
  const apiConfigWorkflows = getApiConfig('DECOS_API', {
    formatUrl: (config) => {
      return `${config.url}/items/${zaakID}/workflows`;
    },
    transformResponse: transformDecosWorkflowKeysResponse,
  });

  const { content: latestWorkflowKey } = await requestData<string | null>(
    apiConfigWorkflows,
    requestID
  );

  if (!latestWorkflowKey) {
    return apiSuccessResult(null);
  }

  const apiConfigSingleWorkflow = getApiConfig('DECOS_API', {
    formatUrl: (config) => {
      return `${config.url}/items/${latestWorkflowKey}/workflowlinkinstances?properties=false&fetchParents=false&select=mark,date1,date2,text7,sequence&orderBy=sequence&filter=text7 eq '${stepTitle}'`;
    },
    transformResponse: (responseData) =>
      transformDecosWorkflowDateResponse(stepTitle, responseData),
  });

  return requestData<DecosWorkflowStepDate>(apiConfigSingleWorkflow, requestID);
}

async function fetchIsPdfDocument(
  requestID: RequestID,
  documentKey: VergunningDocument['key']
) {
  // items / { document_id } / blob ? select = bol10
  const apiConfigDocuments = getApiConfig('DECOS_API', {
    formatUrl: (config) => {
      return `${config.url}/items/${documentKey}/blob?select=bol10&filter=bol10 eq true`;
    },
    transformResponse: (
      responseDataSource: DecosZakenResponse<DecosDocumentBlobSource[]>
    ) => {
      const lastDoc = responseDataSource.content?.pop();
      return { isPDF: !!lastDoc?.fields.bol10, key: lastDoc?.key };
    },
  });

  const documentTransformed = await requestData<{
    isPDF: boolean;
    key: string;
  }>(apiConfigDocuments, requestID);
  return documentTransformed;
}

function filterValidDocument({
  fields: documentMetadata,
}: DecosDocumentSource) {
  const isDefinitief = documentMetadata.text39?.toLowerCase() === 'definitief';
  const isOpenbaar = ['openbaar', 'beperkt openbaar'].includes(
    documentMetadata.text40?.toLowerCase()
  );
  const isAllowed = documentMetadata.text41?.toLowerCase() !== 'nvt';
  return isDefinitief && isOpenbaar && isAllowed;
}

async function transformDecosDocumentListResponse(
  requestID: RequestID,
  decosDocumentsListResponse: DecosZakenResponse<DecosDocumentSource[]>
) {
  if (Array.isArray(decosDocumentsListResponse.content)) {
    const documentsSourceFiltered = decosDocumentsListResponse.content
      .filter(filterValidDocument)
      .map(async ({ fields: documentMetadata, key }) => {
        const isPdfResponse = await fetchIsPdfDocument(requestID, key);
        if (isPdfResponse.status === 'OK' && isPdfResponse.content.isPDF) {
          const vergunningDocument: VergunningDocument = {
            id: documentMetadata.mark,
            key: isPdfResponse.content.key,
            title: documentMetadata.text41,
            datePublished: documentMetadata.received_date,
            url: '', // Url is constructed in vergunningen.ts
          };
          return vergunningDocument;
        }
        return null;
      });

    const documents = (await Promise.all(documentsSourceFiltered)).filter(
      (document: VergunningDocument | null): document is VergunningDocument =>
        document !== null
    );
    return documents;
  }

  return [];
}

export async function fetchDecosDocumentList(
  requestID: RequestID,
  zaakID: VergunningV2['key']
) {
  const apiConfigDocuments = getApiConfig('DECOS_API', {
    formatUrl: (config) => {
      return `${config.url}/items/${zaakID}/documents?top=50&select=subject1,sequence,mark,text39,text40,text41,itemtype_key,received_date&filter=text39 eq 'Definitief'`;
    },
  });

  const documentsSource = await requestData<
    DecosZakenResponse<DecosDocumentSource[]>
  >(apiConfigDocuments, requestID);

  if (documentsSource.status === 'OK') {
    const documentsTransformed = await transformDecosDocumentListResponse(
      requestID,
      documentsSource.content
    );
    return apiSuccessResult(documentsTransformed);
  }
  return documentsSource;
}

export async function fetchDecosZaakFromSource(
  requestID: RequestID,
  zaakID: VergunningV2['key'],
  includeProperties: boolean = false
) {
  // Fetch the zaak from Decos, this request will return all the fieldNames, no need to specify the ?select= query.
  const apiConfig = getApiConfig('DECOS_API', {
    formatUrl: (config) => {
      return `${config.url}/items/${zaakID}${includeProperties ? '?properties=true' : ''}`;
    },
    transformResponse: (responseData: DecosZakenResponse) => {
      if (responseData.content) {
        return responseData.content[0];
      }
      return responseData;
    },
  });

  return requestData<DecosZaakSource | null>(apiConfig, requestID);
}

export async function fetchDecosVergunning(
  requestID: RequestID,
  zaakID: VergunningV2['key']
) {
  const decosZaakSourceRequest = fetchDecosZaakFromSource(requestID, zaakID);
  const decosZaakDocumentsRequest = fetchDecosDocumentList(requestID, zaakID);

  const [zaakSourceResponseSettled, documentsResponseSettled] =
    await Promise.allSettled([
      decosZaakSourceRequest,
      decosZaakDocumentsRequest,
    ]);

  const zaakSourceResponse = getSettledResult(zaakSourceResponseSettled);
  const documentsResponse = getSettledResult(documentsResponseSettled);

  let documents: VergunningDocument[] = [];
  let vergunning: VergunningV2 | null = null;

  if (zaakSourceResponse.status == 'OK') {
    const decosZaakResponseData = zaakSourceResponse.content;

    if (decosZaakResponseData) {
      try {
        vergunning = await transformDecosZaakResponse(
          requestID,
          decosZaakResponseData
        );
      } catch (error) {
        captureException(error);
      }
    }

    if (documentsResponse.status === 'OK' && vergunning !== null) {
      documents = documentsResponse.content;
    }

    return apiSuccessResult({
      vergunning,
      documents,
    });
  }

  return zaakSourceResponse;
}

export async function fetchDecosDocument(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken,
  documentID: string
) {
  const apiConfigDocument = getApiConfig('DECOS_API', {
    formatUrl: (config) => {
      return `${config.url}/items/${documentID}/content`;
    },
  });

  const config: DataRequestConfig = {
    ...apiConfigDocument,
    responseType: 'stream',
    headers: {
      Authorization: apiConfigDocument.headers?.Authorization,
      Accept: 'application/octet-stream',
    },
    transformResponse: (documentResponseData) => {
      return {
        data: documentResponseData,
      };
    },
  };

  return requestData<DocumentDownloadData>(
    config,
    requestID,
    authProfileAndToken
  );
}

export const forTesting = {
  filterValidDocument,
  getUserKeys,
  getZakenByUserKey,
  transformDecosDocumentListResponse,
  transformDecosWorkflowDateResponse,
  transformDecosWorkflowKeysResponse,
  transformDecosZaakResponse,
  transformDecosZakenResponse,
};
