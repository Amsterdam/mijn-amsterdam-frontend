import assert from 'assert';

import memoizee from 'memoizee';
import { generatePath } from 'react-router-dom';
import slug from 'slugme';

import {
  DecosZaakBase,
  DecosZaakTransformer,
  MA_DECISION_DEFAULT,
  adresBoekenByProfileType,
  AddressBookEntry,
  DecosFieldValue,
  DecosZaakDocument,
  DecosWorkflowStepDate,
  DecosWorkflowStepTitle,
  DecosDocumentBlobSource,
  DecosDocumentSource,
  DecosZaakSource,
  DecosZakenResponse,
  DecosWorkflowResponse,
} from './config-and-types';
import {
  SELECT_FIELDS_META,
  SELECT_FIELDS_TRANSFORM_BASE,
  caseType,
} from './decos-field-transformers';
import { CASE_TYP_FIELD_DECOS } from './decos-field-transformers';
import {
  getDecosZaakTypeFromSource,
  getStatusDate,
  getUserKeysSearchQuery,
  isExcludedFromTransformation,
  toDateFormatted,
} from './decos-helpers';
import { AppRoute } from '../../../universal/config/routes';
import {
  ApiErrorResponse,
  apiErrorResult,
  ApiResponse,
  ApiSuccessResponse,
  apiSuccessResult,
  getSettledResult,
} from '../../../universal/helpers/api';
import { defaultDateFormat } from '../../../universal/helpers/date';
import { sortAlpha, uniqueArray } from '../../../universal/helpers/utils';
import { AuthProfileAndToken } from '../../auth/auth-types';
import {
  DataRequestConfig,
  DEFAULT_API_CACHE_TTL_MS,
} from '../../config/source-api';
import { encryptSessionIdWithRouteIdParam } from '../../helpers/encrypt-decrypt';
import { getApiConfig } from '../../helpers/source-api-helpers';
import { requestData } from '../../helpers/source-api-request';
import { BffEndpoints } from '../../routing/bff-routes';
import { generateFullApiUrlBFF } from '../../routing/route-helpers';
import { captureException, captureMessage } from '../monitoring';
import { DocumentDownloadData } from '../shared/document-download-route-handler';
import { isExpired } from '../vergunningen/vergunningen-helpers';
/**
 * The Decos service ties responses of various api calls together and produces a set of transformed set of decosZaken.
 *
 * Service: **fetchDecosZaken**
 *
 * First we query Decos for a `key` to see if a certain userID (BSN or KVKNUMBER) is known in the system. We look for the values of the userID in so called AddressBooks.
 * The id's (keys) of the addressbooks are static values. So we put together a search query that looks for an AddressBook entry in a
 * specic AddressBook table that matches a condition (num1 should be the userID)
 *
 * After querying the AddressBook we use the keys that were retrieved to look for Zaken tied to these AddressBookEntry keys.
 * Initially we only select a set of specific api attributes (fields (defined in the transformer of a certain caseTye)) that we want to be processed/transformed. This reduces the response size and should be faster.
 *
 * After retrieving the zaken we check for data quality, payment and other arbitrary checks (hasValidSourceData).
 *
 * We now have filtered set of decos zaken which we want to make sense of first by transforming the api attributes to understandable
 * ones for example the source attribute `document_date` becomes `dateRequest`.
 *
 * After transformation of the api attribute names and possibly values, we apply another, optional, transform to the data.
 * At this point we can fetch other services to enrich the data we retrieved initially or maybe assign values to some properties based on business logic.
 *
 * Service: **fetchDecosZaak**
 *
 * Retrieves one zaak based on a key found in the fetchDecosZaken call. This service is used to provide the data for the detailed view of a decos zaak.
 * This api call to Decos does not specify any fields to be selected and instead retrieves all the fields related to the requested zaak. Source validity checks / filtering is
 * not performed at this stage because we should only have the keys of individual zaken that we got from the fetchDecosZaken service.
 *
 * Event though we retrieve all source fields/values for a specific case, only ones specified (transformFields) end up in the data sent to the user.
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
 * Service: **fetchDecosDocument**
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

async function transformDecosZaakResponse<
  T extends DecosZaakTransformer<any>,
  DZ extends DecosZaakBase = NestedType<T>,
>(
  requestID: RequestID,
  decosZaakTransformers: T[],
  decosZaakSource: DecosZaakSource
): Promise<DZ | null> {
  const zaakType: T['caseType'] = getDecosZaakTypeFromSource(decosZaakSource);
  const decosZaakTransformer = decosZaakTransformers.find(
    (transformer) => transformer.caseType == zaakType
  );

  if (!decosZaakTransformer || !decosZaakTransformer.transformFields) {
    captureMessage(`No transformer for zaakType ${zaakType}`);
    return null;
  }

  if (isExcludedFromTransformation(decosZaakSource, decosZaakTransformer)) {
    return null;
  }

  // Iterates over the desired data fields (key=>value pairs) and transforms values if necessary.
  const transformedFieldEntries = Object.entries(
    decosZaakTransformer.transformFields
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
          ? fieldTransformer.transform(value)
          : value;
    } catch (err) {
      captureException(err);
    }

    return [fieldNameTransformed ?? fieldNameSource, nValue];
  });

  // Create an object from the transformed fieldNames and values
  const transformedFields = Object.fromEntries(transformedFieldEntries);

  // Create the base data for the decosZaak. This object is not guaranteed to have all fields defined in the type for a specific decosZaak.
  // It depends on the query and resturned result to the decos api which field value ends up in the decosZaak.
  // For example, if we selected only the sourcefield `mark` we'd have a decosZaak with a value for `identifier`..
  let decosZaak: DZ = {
    id:
      transformedFields.identifier?.replace(/\//g, '-') ??
      'unknown-decoszaak-id',
    key: decosZaakSource.key,
    title: decosZaakTransformer.title,
    statusDates: [], // Serves as placeholder, values for this property will be added async below.
    termijnDates: [], // Serves as placeholder, values for this property will be added async below.
    ...transformedFields,
  };

  if (decosZaakTransformer.fetchWorkflowStatusDatesFor) {
    const stepTitles = decosZaakTransformer.fetchWorkflowStatusDatesFor.map(
      ({ stepTitle }) => stepTitle
    );
    const workFlowDates = await fetchDecosWorkflowDates(
      requestID,
      decosZaakSource.key,
      stepTitles
    );
    if (workFlowDates.status === 'OK') {
      decosZaak.statusDates =
        decosZaakTransformer.fetchWorkflowStatusDatesFor.map(
          ({ status, stepTitle }) => ({
            status,
            datePublished: workFlowDates.content?.[stepTitle] ?? null,
          })
        );
    }
  }

  if (decosZaakTransformer.fetchTermijnenFor) {
    const termijnMap = Object.fromEntries(
      decosZaakTransformer.fetchTermijnenFor.map((termijn) => [
        termijn.type,
        termijn.status,
      ])
    );
    const termijnDates = await fetchDecosTermijnen(
      requestID,
      decosZaakSource.key,
      Object.keys(termijnMap)
    );
    if (termijnDates.status === 'OK') {
      decosZaak.termijnDates = termijnDates.content
        .map((termijn) => ({
          status: termijnMap[termijn.type] ?? null,
          dateStart: termijn.dateStart,
          dateEnd: termijn.dateEnd,
        }))
        .filter((termijn) => termijn.status !== null);
    }
  }

  if (decosZaak.processed && !decosZaak.decision) {
    decosZaak.decision = MA_DECISION_DEFAULT;
  }

  // After initial transformation of the data is done, perform a Post transform action.
  // It's possible to handle some data quality improvements and/or business logic operations in the after transform function.
  if (decosZaakTransformer.afterTransform) {
    decosZaak = await decosZaakTransformer.afterTransform(
      decosZaak,
      decosZaakSource
    );
  }

  return decosZaak;
}

async function transformDecosZakenResponse<
  T extends DecosZaakTransformer<any>,
  DZ extends DecosZaakBase = NestedType<T>,
>(
  requestID: RequestID,
  decosZaakTransformers: T[],
  decosZakenSource: DecosZaakSource[]
) {
  const zakenToBeTransformed: [T, DecosZaakSource][] = [];
  for (const decosZaakSource of decosZakenSource) {
    const zaakType: T['caseType'] = getDecosZaakTypeFromSource(decosZaakSource);
    const decosZaakTransformer = decosZaakTransformers.find(
      (transformer) => transformer.caseType == zaakType
    );

    // exclude decosZaakSources that do not have a matching decosZaakTransformer
    if (!decosZaakTransformer) {
      continue;
    }

    // Exclude zaken that match the following conditions
    if (isExcludedFromTransformation(decosZaakSource, decosZaakTransformer)) {
      continue;
    }

    zakenToBeTransformed.push([decosZaakTransformer, decosZaakSource]);
  }

  let decosZaken: Array<DZ | null> = [];

  try {
    decosZaken = await Promise.all(
      zakenToBeTransformed.map(([decosZaakTransformer, decosZaak]) => {
        return transformDecosZaakResponse(
          requestID,
          [decosZaakTransformer],
          decosZaak
        );
      })
    );
  } catch (err) {
    captureException(err);
  }

  return decosZaken
    .filter((decosZaak: DZ | null): decosZaak is DZ => decosZaak !== null)
    .sort(sortAlpha('identifier', 'desc'));
}

function getSelectFields(
  zaakTypeTransformers: DecosZaakTransformer<DecosZaakBase>[]
) {
  const fields = uniqueArray([
    ...SELECT_FIELDS_META,
    ...zaakTypeTransformers.flatMap((zaakTransformer) =>
      Object.keys(zaakTransformer.transformFields)
    ),
  ]).join(',');

  return fields;
}

async function getZakenByUserKey(
  requestID: RequestID,
  userKey: string,
  zaakTypeTransformers: DecosZaakTransformer<DecosZaakBase>[] = []
) {
  assert(
    SELECT_FIELDS_TRANSFORM_BASE[CASE_TYP_FIELD_DECOS] == caseType,
    `getZakenByUserKey expects field ${CASE_TYP_FIELD_DECOS} to be the caseType`
  );

  const fields = getSelectFields(zaakTypeTransformers);

  const caseTypes = zaakTypeTransformers
    .map(
      (transformer) => `${CASE_TYP_FIELD_DECOS} eq '${transformer.caseType}'`
    )
    .join(' or ');

  const decosUrlParams = new URLSearchParams({
    top: '50',
    ...(fields && { select: fields }),
    ...(caseTypes && { filter: caseTypes }),
  });

  const apiConfig = getApiConfig('DECOS_API', {
    formatUrl: (config) => {
      return `${config.url}/items/${userKey}/folders?${decosUrlParams}`;
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

export async function fetchDecosZakenFromSourceRaw(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken,
  selectFields?: string,
  filterCaseTypes?: string,
  includeProperties: boolean = false,
  top: string = '50'
) {
  const userKeysResponse = await getUserKeys(requestID, authProfileAndToken);

  const caseTypes = filterCaseTypes
    ?.split(',')
    .map((caseType) => `${CASE_TYP_FIELD_DECOS} eq '${caseType}'`)
    .join(' or ');

  const queryParams = new URLSearchParams({
    top,
    properties: includeProperties ? 'true' : 'false',
    ...(selectFields && { select: selectFields }),
    ...(filterCaseTypes && { filter: caseTypes }),
  });

  async function fetchZakenByUserKey(userKey: string) {
    const apiConfig = getApiConfig('DECOS_API', {
      formatUrl: (config) => {
        return `${config.url}/items/${userKey}/folders?${queryParams}`;
      },
      transformResponse: (responseData: DecosZakenResponse) => {
        if (!Array.isArray(responseData?.content)) {
          return [];
        }
        return responseData.content;
      },
    });

    return requestData<DecosZaakSource[]>(apiConfig, `${requestID}-${userKey}`);
  }

  if (userKeysResponse.status === 'ERROR') {
    return apiErrorResult('Failed to fetch user keys', null);
  }

  const responseContent = [];

  for (const userKey of userKeysResponse.content) {
    const response = await fetchZakenByUserKey(userKey);
    if (response.status === 'OK') {
      responseContent.push(...response.content);
    }
  }

  return apiSuccessResult(responseContent);
}

export async function fetchDecosZakenFromSource(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken,
  zaakTypeTransformers: DecosZaakTransformer<DecosZaakBase>[] = []
) {
  const userKeysResponse = await getUserKeys(requestID, authProfileAndToken);

  if (userKeysResponse.status === 'ERROR') {
    return userKeysResponse;
  }

  const zakenSourceResponses = await Promise.allSettled(
    userKeysResponse.content.map((userKey) =>
      getZakenByUserKey(requestID, userKey, zaakTypeTransformers)
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

export async function fetchDecosZaken_<
  T extends DecosZaakTransformer<any>,
  DZ extends DecosZaakBase = NestedType<T>,
>(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken,
  zaakTypeTransformers: T[]
): Promise<ApiSuccessResponse<DZ[]> | ApiErrorResponse<null>> {
  const zakenSourceResponse = await fetchDecosZakenFromSource(
    requestID,
    authProfileAndToken,
    zaakTypeTransformers
  );

  if (zakenSourceResponse.status === 'OK') {
    const decosZakenSource = zakenSourceResponse.content;
    const zaken = await transformDecosZakenResponse(
      requestID,
      zaakTypeTransformers,
      decosZakenSource
    );
    return apiSuccessResult(zaken);
  }

  return zakenSourceResponse;
}

export const fetchDecosZaken = memoizee(fetchDecosZaken_, {
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
  stepTitles: DecosWorkflowStepTitle[],
  singleWorkflowResponseData: DecosWorkflowResponse
): { [key: DecosWorkflowStepTitle]: string | null } {
  const responseStepTitleDates = singleWorkflowResponseData.content
    .filter((workflowStep) => workflowStep.fields.text7 != null)
    .reduce(
      (acc, workflowStep) => ({
        ...acc,
        [workflowStep.fields.text7]: workflowStep.fields.date1 ?? null,
      }),
      {} as Record<string, string | null>
    );

  const stepTitleToDate = stepTitles.reduce(
    (acc, stepTitle) => ({
      ...acc,
      [stepTitle]: responseStepTitleDates[stepTitle] ?? null,
    }),
    {} as Record<DecosWorkflowStepTitle, string | null>
  );
  return stepTitleToDate;
}

export async function fetchDecosWorkflowDates(
  requestID: RequestID,
  zaakID: DecosZaakBase['key'],
  stepTitles: DecosWorkflowStepTitle[]
): Promise<
  ApiResponse<Record<string, DecosWorkflowStepDate | null | undefined>>
> {
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
    return apiSuccessResult({});
  }

  const urlParams = new URLSearchParams({
    top: '50',
    properties: 'false',
    fetchParents: 'false',
    select: ['mark', 'date1', 'date2', 'text7'].join(','),
    filter: stepTitles
      .map((stepTitle) => `text7 eq '${stepTitle}'`)
      .join(' or '),
  });

  const apiConfigSingleWorkflow = getApiConfig('DECOS_API', {
    formatUrl: (config) =>
      `${config.url}/items/${latestWorkflowKey}/workflowlinkinstances?${urlParams}`,
    transformResponse: (responseData: DecosWorkflowResponse) =>
      transformDecosWorkflowDateResponse(stepTitles, responseData),
  });

  return requestData(apiConfigSingleWorkflow, requestID);
}

export async function fetchDecosTermijnen(
  requestID: RequestID,
  zaakID: DecosZaakBase['key'],
  termijnTypes: DecosTermijnType[]
): Promise<ApiResponse<DecosTermijn[]>> {
  const urlParams = new URLSearchParams({
    top: '50',
    properties: 'false',
    fetchParents: 'false',
    select: ['date4', 'date5', 'subject1'].join(','),
    orderBy: 'date4',
    filter: termijnTypes
      .map((termijnType) => `subject1 eq '${termijnType}'`)
      .join(' or '),
  });

  const transformDecosTermijnenResponse = (
    singleTermijnResponseData: DecosTermijnResponse
  ): DecosTermijn[] => {
    return singleTermijnResponseData.content.map(({ fields }) => ({
      type: fields.subject1,
      dateStart: fields.date4,
      dateEnd: fields.date5,
    }));
  };

  const apiConfigTermijnens = getApiConfig('DECOS_API', {
    formatUrl: (config) => {
      return `${config.url}/items/${zaakID}/termijnens?${urlParams}`;
    },
    transformResponse: transformDecosTermijnenResponse,
  });

  return requestData(apiConfigTermijnens, requestID);
}

async function fetchIsPdfDocument(
  requestID: RequestID,
  documentKey: DecosZaakDocument['key']
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
  sessionID: SessionID,
  decosDocumentsListResponse: DecosZakenResponse<DecosDocumentSource[]>
) {
  if (Array.isArray(decosDocumentsListResponse.content)) {
    const documentsSourceFiltered = decosDocumentsListResponse.content
      .filter(filterValidDocument)
      .map(async ({ fields: documentMetadata, key }) => {
        const isPdfResponse = await fetchIsPdfDocument(requestID, key);
        if (isPdfResponse.status === 'OK' && isPdfResponse.content.isPDF) {
          const decosZaakDocument: DecosZaakDocument = {
            id: documentMetadata.mark,
            key: isPdfResponse.content.key,
            title: documentMetadata.text41,
            datePublished: documentMetadata.received_date,
            url: '',
          };
          return decosZaakDocument;
        }
        return null;
      });

    const documents = (await Promise.all(documentsSourceFiltered)).filter(
      (document: DecosZaakDocument | null): document is DecosZaakDocument =>
        document !== null
    );
    return documents;
  }

  return [];
}

export async function fetchDecosDocumentList(
  requestID: RequestID,
  sessionID: SessionID,
  zaakID: DecosZaakBase['key']
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
      sessionID,
      documentsSource.content
    );
    return apiSuccessResult(documentsTransformed);
  }
  return documentsSource;
}

export async function fetchDecosZaakFromSource(
  requestID: RequestID,
  zaakID: DecosZaakBase['key'],
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

type NestedType<T> = T extends DecosZaakTransformer<infer R> ? R : never;

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

export function transformDecosZaakFrontend<T extends DecosZaakBase>(
  sessionID: SessionID,
  zaak: T,
  appRoute: AppRoute
): DecosZaakFrontend<T> {
  const idEncrypted = encryptSessionIdWithRouteIdParam(sessionID, zaak.key);
  const zaakFrontend: DecosZaakFrontend<T> = {
    ...zaak,
    dateDecisionFormatted: toDateFormatted(zaak.dateDecision),
    dateInBehandeling: getStatusDate('In behandeling', zaak),
    dateInBehandelingFormatted: toDateFormatted(
      getStatusDate('In behandeling', zaak)
    ),
    dateRequestFormatted: defaultDateFormat(zaak.dateRequest),
    // Assign Status steps later on
    steps: [],
    // Adds an url with encrypted id to the BFF Detail page api for zaken.
    fetchDocumentsUrl: generateFullApiUrlBFF(
      BffEndpoints.DECOS_DOCUMENTS_LIST,
      [{ id: idEncrypted }]
    ),
    link: {
      to: generatePath(appRoute, {
        caseType: slug(zaak.caseType, {
          lower: true,
        }),
        id: zaak.id,
      }),
      title: `Bekijk hoe het met uw aanvraag staat`,
    },
  };

  // If a zaak has both dateStart and dateEnd add formatted dates and an expiration indication.
  if (
    'dateEnd' in zaak &&
    'dateStart' in zaak &&
    zaak.dateStart &&
    zaak.dateEnd
  ) {
    zaakFrontend.isExpired = isExpired(zaak);
    zaakFrontend.dateStartFormatted = defaultDateFormat(zaak.dateStart);
    zaakFrontend.dateEndFormatted = defaultDateFormat(zaak.dateEnd);
  }

  return zaakFrontend;
}

export const forTesting = {
  filterValidDocument,
  getUserKeys,
  getSelectFields,
  getZakenByUserKey,
  transformDecosDocumentListResponse,
  transformDecosWorkflowDateResponse,
  transformDecosWorkflowKeysResponse,
  transformDecosZaakResponse,
  transformDecosZakenResponse,
  transformDecosZaakFrontend,
};
