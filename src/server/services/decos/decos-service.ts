import assert from 'assert';

import createDebugger from 'debug';
import { generatePath } from 'react-router';
import slug from 'slugme';

import {
  CASE_TYP_FIELD_DECOS,
  caseType,
  MA_DECISION_DEFAULT,
  SELECT_FIELDS_META,
  SELECT_FIELDS_TRANSFORM_BASE,
} from './decos-field-transformers';
import {
  getDecosZaakTypeFromSource,
  getDisplayStatus,
  getUserKeysSearchQuery,
  isExcludedFromTransformation,
  isExpired,
  isZaakDecisionVerleend,
} from './decos-helpers';
import type {
  AddressBookEntry,
  DecosZaakTransformer,
  DecosZaakBase,
  DecosZaakSource,
  DecosFieldTransformerObject,
  DecosFieldsObject,
  DecosFieldValue,
  DecosZakenResponse,
  DecosWorkflowSource,
  DecosTermijnType,
  DecosTermijn,
  DecosTermijnResponse,
  DecosLinkedFieldResponse,
  DecosZaakDocument,
  DecosDocumentBlobSource,
  DecosDocumentSource,
  DecosZaakFrontend,
  WithDateRange,
} from './decos-types';
import { IS_PRODUCTION } from '../../../universal/config/env';
import {
  apiErrorResult,
  ApiResponse,
  apiSuccessResult,
  getSettledResult,
} from '../../../universal/helpers/api';
import {
  omit,
  sortAlpha,
  toDateFormatted,
  uniqueArray,
} from '../../../universal/helpers/utils';
import type { StatusLineItem } from '../../../universal/types/App.types';
import { AuthProfileAndToken } from '../../auth/auth-types';
import { DataRequestConfig } from '../../config/source-api';
import { encryptSessionIdWithRouteIdParam } from '../../helpers/encrypt-decrypt';
import { getApiConfig } from '../../helpers/source-api-helpers';
import {
  getRequestParamsFromQueryString,
  requestData,
} from '../../helpers/source-api-request';
import { BffEndpoints } from '../../routing/bff-routes';
import { generateFullApiUrlBFF } from '../../routing/route-helpers';
import { captureException, captureMessage } from '../monitoring';
import { DocumentDownloadData } from '../shared/document-download-route-handler';

const debug = createDebugger('decos-service');

export const adresBoekenBSN =
  process.env.BFF_DECOS_API_ADRES_BOEKEN_BSN?.split(',') ?? [];

export const adresBoekenKVK =
  process.env.BFF_DECOS_API_ADRES_BOEKEN_KVK?.split(',') ?? [];

export const adresBoekenByProfileType: Record<ProfileType, string[]> = {
  private: adresBoekenBSN,
  commercial: adresBoekenKVK,
  'private-attributes': [],
};

export const DECOS_ZAKEN_FETCH_TOP = '200';

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
 * Service: **fetchDecosWorkflows**
 *
 * Retrieves workflow instances related to a specific zaak based on the zaakID (key). The workflow instances can be used to determine a date related to a status of the zaak on a certain point in time.
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

async function fetchUserKeys(authProfileAndToken: AuthProfileAndToken) {
  const apiConfig = getApiConfig('DECOS_API', {
    method: 'post',
    formatUrl: (config) => {
      return `${config.url}/search/books`;
    },
    params: getRequestParamsFromQueryString('properties=false&select=key'),
    transformResponse: (responseData) => {
      return responseData?.itemDataResultSet?.content ?? [];
    },
  });

  const bookSearches = [];
  const adresBoeken =
    adresBoekenByProfileType[authProfileAndToken.profile.profileType];
  debug({ adresBoeken });
  // First find user keys associated with the current user.id (bsn or kvk)
  for (const addressBookKey of adresBoeken) {
    const requestBody = getUserKeysSearchQuery(
      addressBookKey,
      authProfileAndToken.profile.id
    );
    const requestConfig = {
      ...apiConfig,
      data: requestBody,
      // only need to fetch once per logged in user
      cacheKey: `${authProfileAndToken.profile.id}-${addressBookKey}`,
    };
    const request = requestData<AddressBookEntry[]>(requestConfig).then(
      (response) => ({
        addressBookKey,
        response,
      })
    );
    bookSearches.push(request);
  }

  const bookSearchResponses = await Promise.all(bookSearches);

  const userKeys = [];

  for (const result of bookSearchResponses) {
    debug({
      [`bookSearchResponse:${result.addressBookKey}`]: {
        count: result.response.content?.length ?? 0,
      },
    });
    if (result.response.status === 'ERROR') {
      return result.response;
    }
    if (Array.isArray(result.response.content)) {
      userKeys.push(...result.response.content.map((record) => record.key));
    }
  }

  return apiSuccessResult(userKeys);
}

async function transformDecosZaakResponse<
  T extends DecosZaakTransformer,
  DZ extends DecosZaakBase = NestedType<T>,
>(
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

  const linkedItems = await (async () => {
    if (!decosZaakTransformer.fetchLinkedItem) {
      return [];
    }
    const fetchLinkedItem = async (decosLinkName: string) => {
      const r = await fetchDecosLinkedField(decosZaakSource.key, decosLinkName);
      if (r.status === 'OK') {
        return r.content;
      }
      return null;
    };
    const decosLinkItems = await Promise.all(
      decosZaakTransformer.fetchLinkedItem.map(fetchLinkedItem)
    );
    const fields = decosZaakTransformer.fetchLinkedItem.map(
      (decosLinkName, index) => [decosLinkName, decosLinkItems[index]]
    );

    return Object.fromEntries(fields);
  })();

  // Iterates over the desired data fields (key=>value pairs) and transforms values if necessary.
  const transformedFields = transformFieldValuePairs(
    decosZaakTransformer.transformFields,
    { ...decosZaakSource.fields, ...linkedItems }
  );

  // Create the base data for the decosZaak. This object is not guaranteed to have all fields defined in the type for a specific decosZaak.
  // It depends on the query and returned result from the decos api which field value ends up in the decosZaak.
  // For example, if we selected only the sourcefield `mark` we'd have a decosZaak with a value for `identifier`..
  let decosZaak: DZ = {
    id: transformedFields.identifier.replaceAll('/', '-'),
    itemType: decosZaakTransformer.itemType,
    key: decosZaakSource.key,
    title: decosZaakTransformer.title,
    statusDates: [], // Serves as placeholder, values for this property will be added async below.
    termijnDates: [], // Serves as placeholder, values for this property will be added async below.
    ...transformedFields,
  };

  if (decosZaakTransformer.fetchWorkflowStatusDatesFor?.length) {
    const workFlowResponse = await fetchDecosWorkflows(
      decosZaakSource.key,
      decosZaakTransformer.fetchWorkflowStatusDatesFor
    );

    if (workFlowResponse.status === 'OK' && workFlowResponse.content?.length) {
      const [workflowSource] = workFlowResponse.content;
      decosZaak.statusDates =
        decosZaakTransformer.fetchWorkflowStatusDatesFor.map(
          ({ status, actionCodeFieldName = 'text7', decosActionCode }) => ({
            status,
            datePublished:
              workflowSource.instances?.find(
                ({ fields }) => fields[actionCodeFieldName] === decosActionCode
              )?.fields.date1 ?? null,
          })
        );
    }
  }

  // We add a default status date for "In behandeling" if no workflow status dates are found.
  if (
    !decosZaakTransformer.fetchWorkflowStatusDatesFor?.some(
      ({ status }) => status === 'In behandeling'
    )
  ) {
    decosZaak.statusDates = [
      ...decosZaak.statusDates,
      { datePublished: decosZaak.dateRequest, status: 'In behandeling' },
    ];
  }

  if (decosZaakTransformer.fetchTermijnenFor?.length) {
    const termijnMap = Object.fromEntries(
      decosZaakTransformer.fetchTermijnenFor.map((termijn) => [
        termijn.type,
        termijn.status,
      ])
    );
    const termijnDates = await fetchDecosTermijnen(
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

  // If a zaak has both dateStart and dateEnd add formatted dates and an expiration indication.
  if (
    'dateEnd' in decosZaak &&
    decosZaak.dateEnd &&
    'dateStart' in decosZaak &&
    decosZaak.dateStart
  ) {
    decosZaak = {
      ...decosZaak,
      isExpired: isExpired(decosZaak.dateEnd),
      dateStartFormatted: toDateFormatted(decosZaak.dateStart),
      dateEndFormatted: toDateFormatted(decosZaak.dateEnd),
    };
  }

  // After initial transformation of the data is done, perform a Post transform action.
  // It's possible to handle some data quality improvements and/or business logic operations in the after transform function.
  if (decosZaakTransformer.afterTransform) {
    decosZaak = await decosZaakTransformer.afterTransform(
      decosZaak,
      decosZaakSource
    );
  }

  decosZaak.isVerleend = decosZaakTransformer.isVerleend
    ? decosZaakTransformer.isVerleend(decosZaak, decosZaakSource)
    : isZaakDecisionVerleend(decosZaak);

  if (decosZaak.processed && !decosZaak.decision) {
    decosZaak.decision = MA_DECISION_DEFAULT;
  }

  return decosZaak;
}

export function transformFieldValuePairs<T extends DecosZaakBase>(
  transformFields: Partial<DecosFieldTransformerObject<T>>,
  fields: DecosFieldsObject
) {
  const transformedFieldEntries = Object.entries(transformFields).map(
    ([fieldNameSource, fieldTransformer]) => {
      const fieldNameTransformed =
        typeof fieldTransformer === 'object'
          ? fieldTransformer.name
          : fieldTransformer;

      const value = fields[fieldNameSource] ?? null;

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
    }
  );

  return Object.fromEntries(transformedFieldEntries);
}

async function transformDecosZakenResponse<
  T extends DecosZaakTransformer,
  DZ extends DecosZaakBase = NestedType<T>,
>(decosZaakTransformers: T[], decosZakenSource: DecosZaakSource[]) {
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
        return transformDecosZaakResponse([decosZaakTransformer], decosZaak);
      })
    );
  } catch (err) {
    captureException(err);
  }

  return decosZaken
    .filter((decosZaak: DZ | null): decosZaak is DZ => decosZaak !== null)
    .sort(sortAlpha('identifier', 'desc'));
}

function getSelectFields(zaakTypeTransformers: DecosZaakTransformer[]) {
  const fields = uniqueArray([
    ...SELECT_FIELDS_META,
    ...zaakTypeTransformers.flatMap((zaakTransformer) =>
      Object.keys(zaakTransformer.transformFields || [])
        .filter((field) => !zaakTransformer.fetchLinkedItem?.includes(field))
        .concat(zaakTransformer.additionalSelectFields ?? [])
    ),
  ]).join(',');

  return fields;
}

async function fetchZakenByUserKey(
  userKey: string,
  zaakTypeTransformers: DecosZaakTransformer[]
) {
  assert(
    SELECT_FIELDS_TRANSFORM_BASE[CASE_TYP_FIELD_DECOS] == caseType,
    `getZakenByUserKey expects field ${CASE_TYP_FIELD_DECOS} to be the caseType`
  );
  const zaakTypeTransformersByItemType = zaakTypeTransformers.reduce<
    Record<DecosZaakTransformer['itemType'], DecosZaakTransformer[]>
  >((acc, transformer) => {
    (acc[transformer.itemType] ||= []).push(transformer);
    return acc;
  }, {});

  const responseSourcePromises = Object.entries(
    zaakTypeTransformersByItemType
  ).map(async ([itemType, zaakTransformers]) => {
    const fields = getSelectFields(zaakTransformers);
    const caseTypes = zaakTransformers.flatMap(
      (transformer) => transformer.caseType || []
    );
    const caseTypeQuery = caseTypes
      .map((caseType) => `(${CASE_TYP_FIELD_DECOS} eq '${caseType}')`)
      .join(' or ');

    const decosUrlParams = new URLSearchParams({
      top: DECOS_ZAKEN_FETCH_TOP,
      select: fields,
      filter: caseTypeQuery,
    });

    const apiConfig = getApiConfig('DECOS_API', {
      formatUrl: (config) => {
        return `${config.url}/items/${userKey}/${itemType}`;
      },
      params: Object.fromEntries(decosUrlParams),
      transformResponse: (responseData: DecosZakenResponse) => {
        if (!Array.isArray(responseData?.content)) {
          return [];
        }
        return responseData.content.map((c) => ({ ...c, itemType }));
      },
    });

    const responseSource = await requestData<DecosZaakSource[]>(apiConfig);
    debug({
      [`getZakenByUserKey:${userKey}`]: {
        caseTypes,
        count: responseSource.content?.length ?? 0,
      },
    });
    return responseSource;
  });

  const responseSources = await Promise.all(responseSourcePromises);
  const firstFailedResponse = responseSources.find(
    (r) => r?.status === 'ERROR'
  );
  if (firstFailedResponse) {
    return apiErrorResult(firstFailedResponse.message, null);
  }

  return apiSuccessResult(
    responseSources.filter((r) => r.status === 'OK').flatMap((r) => r.content)
  );
}

export const ZAAK_SUB_TYPE = [
  'documents',
  'workflows',
  'addresses',
  'cobjects',
  'casetype',
] as const;

export async function fetchDecosZaakByKeyFromSourceRaw(
  key: DecosZaakBase['key'],
  selectFields?: string,
  includeProperties: boolean = false,
  itemType?: (typeof ZAAK_SUB_TYPE)[number]
) {
  const queryParams = new URLSearchParams({
    properties: includeProperties ? 'true' : 'false',
    ...(selectFields && { select: selectFields }),
  });

  const apiConfig = getApiConfig('DECOS_API', {
    formatUrl: (config) => {
      return `${config.url}/items/${key}${itemType ? `/${itemType}` : ''}`;
    },
    params: Object.fromEntries(queryParams),
  });

  return requestData<DecosZaakSource>(apiConfig);
}

export async function fetchDecosZakenFromSourceRaw(
  authProfileAndToken: AuthProfileAndToken,
  selectFields?: string,
  filterCaseTypes?: string,
  includeProperties: boolean = false,
  top: string = DECOS_ZAKEN_FETCH_TOP
) {
  const userKeysResponse = await fetchUserKeys(authProfileAndToken);

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
        return `${config.url}/items/${userKey}/folders`;
      },
      params: Object.fromEntries(queryParams),
      transformResponse: (responseData: DecosZakenResponse) => {
        if (!Array.isArray(responseData?.content)) {
          return [];
        }
        return responseData.content;
      },
    });

    return requestData<DecosZaakSource[]>(apiConfig);
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
  authProfileAndToken: AuthProfileAndToken,
  zaakTypeTransformers: DecosZaakTransformer[]
) {
  const userKeysResponse = await fetchUserKeys(authProfileAndToken);

  if (userKeysResponse.status === 'ERROR') {
    return userKeysResponse;
  }

  const zakenSourceResponses = await Promise.allSettled(
    userKeysResponse.content.map((userKey) =>
      fetchZakenByUserKey(userKey, zaakTypeTransformers)
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

export async function fetchDecosZaken<
  T extends DecosZaakTransformer,
  DZ extends DecosZaakBase = NestedType<T>,
>(
  authProfileAndToken: AuthProfileAndToken,
  zaakTypeTransformers: T[]
): Promise<ApiResponse<DZ[]>> {
  const zakenSourceResponse = await fetchDecosZakenFromSource(
    authProfileAndToken,
    zaakTypeTransformers
  );

  if (zakenSourceResponse.status === 'OK') {
    const decosZakenSource = zakenSourceResponse.content;
    const zaken = await transformDecosZakenResponse(
      zaakTypeTransformers,
      decosZakenSource
    );
    return apiSuccessResult(zaken);
  }

  return zakenSourceResponse;
}

async function fetchWorkflowInstance(options: {
  key: string;
  urlParams?: URLSearchParams;
}) {
  const apiConfigSingleWorkflow = getApiConfig('DECOS_API', {
    formatUrl: (config) =>
      `${config.url}/items/${options.key}/workflowlinkinstances?`,
    params: options.urlParams
      ? Object.fromEntries(options.urlParams)
      : undefined,
    transformResponse: (responseData: DecosZakenResponse) => {
      if (!Array.isArray(responseData?.content)) {
        return [];
      }
      return responseData.content;
    },
  });

  return requestData<DecosWorkflowSource[]>(apiConfigSingleWorkflow);
}

function transformDecosWorkflowKeysResponse(
  workflowsResponseData: DecosZakenResponse<Array<{ key: string }>>
): DecosWorkflowSource['key'][] {
  return workflowsResponseData.content?.map((workflow) => workflow.key) ?? [];
}

export async function fetchDecosWorkflows(
  zaakID: DecosZaakBase['key'],
  workflowInstanceFilterProperties?: DecosZaakTransformer['fetchWorkflowStatusDatesFor'],
  select: string[] = ['mark', 'date1', 'date2', 'text7']
): Promise<
  ApiResponse<Array<{ key: string; instances: DecosWorkflowSource[] | null }>>
> {
  const apiConfigWorkflows = getApiConfig('DECOS_API', {
    formatUrl: (config) => {
      return `${config.url}/items/${zaakID}/workflows`;
    },
    transformResponse: transformDecosWorkflowKeysResponse,
  });

  const { content: workflowKeys } = await requestData<
    DecosWorkflowSource['key'][] | null
  >(apiConfigWorkflows);

  if (!workflowKeys?.length) {
    return apiSuccessResult([]);
  }

  const urlParams = new URLSearchParams({
    top: '50', // 50 is an arbitrary number, it's likely that the number of workflow instances is much lower.
    properties: 'false',
    fetchParents: 'false',
  });

  if (select) {
    urlParams.append('select', select.join(','));
  }

  if (workflowInstanceFilterProperties?.length) {
    urlParams.append(
      'filter',
      workflowInstanceFilterProperties
        .map(
          // Use text7 as default field name for action code.
          ({ actionCodeFieldName = 'text7', decosActionCode }) =>
            `${actionCodeFieldName} eq '${decosActionCode}'`
        )
        .join(' or ')
    );
  }

  return Promise.all(
    workflowKeys.map((key) =>
      fetchWorkflowInstance({
        key,
        urlParams,
      }).then(({ content }) => {
        return {
          key,
          instances: content,
        };
      })
    )
  ).then((workflowInstanceResponses) =>
    apiSuccessResult(workflowInstanceResponses)
  );
}

export async function fetchDecosTermijnen(
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
    if (!singleTermijnResponseData?.content?.length) {
      return [];
    }
    return singleTermijnResponseData.content.map(({ fields }) => ({
      type: fields.subject1,
      dateStart: fields.date4,
      dateEnd: fields.date5,
    }));
  };

  const apiConfigTermijnens = getApiConfig('DECOS_API', {
    formatUrl: (config) => {
      return `${config.url}/items/${zaakID}/termijnens`;
    },
    params: Object.fromEntries(urlParams),
    transformResponse: transformDecosTermijnenResponse,
  });

  return requestData(apiConfigTermijnens);
}

export async function fetchDecosLinkedField(
  zaakID: DecosZaakBase['key'],
  field: string
): Promise<ApiResponse<Record<string, unknown>>> {
  const extractContentList = (singleResponseData: DecosLinkedFieldResponse) => {
    if (!singleResponseData?.content?.length) {
      return [];
    }
    return singleResponseData.content.map(({ key, fields }) => ({
      key,
      ...fields,
    }));
  };

  const apiConfigLinkedField = getApiConfig('DECOS_API', {
    formatUrl: (config) => {
      return `${config.url}/items/${zaakID}/${field}`;
    },
    transformResponse: extractContentList,
  });

  return requestData(apiConfigLinkedField);
}

async function fetchIsPdfDocument(documentKey: DecosZaakDocument['key']) {
  // items / { document_id } / blob ? select = bol10
  const apiConfigDocuments = getApiConfig('DECOS_API', {
    formatUrl: (config) => {
      return `${config.url}/items/${documentKey}/blob`;
    },
    params: getRequestParamsFromQueryString(
      'select=bol10&filter=bol10 eq true'
    ),
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
  }>(apiConfigDocuments);
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
  sessionID: SessionID,
  decosDocumentsListResponse: DecosZakenResponse<DecosDocumentSource[]>
) {
  if (Array.isArray(decosDocumentsListResponse.content)) {
    const documentsSourceFiltered = decosDocumentsListResponse.content
      .filter(filterValidDocument)
      .map(async ({ fields: documentMetadata, key }) => {
        const isPdfResponse = await fetchIsPdfDocument(key);
        if (isPdfResponse.status === 'OK' && isPdfResponse.content.isPDF) {
          const decosZaakDocument: DecosZaakDocument = {
            id: documentMetadata.mark,
            key: isPdfResponse.content.key,
            title: documentMetadata.text41 || 'Document',
            datePublished: documentMetadata.received_date,
            url: generateFullApiUrlBFF(BffEndpoints.DECOS_DOCUMENT_DOWNLOAD, [
              {
                id: encryptSessionIdWithRouteIdParam(
                  sessionID,
                  isPdfResponse.content.key
                ),
              },
            ]),
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
  sessionID: SessionID,
  zaakID: DecosZaakBase['key']
) {
  const apiConfigDocuments = getApiConfig('DECOS_API', {
    formatUrl: (config) => {
      return `${config.url}/items/${zaakID}/documents`;
    },
    params: getRequestParamsFromQueryString(
      `top=50&select=subject1,sequence,mark,text39,text40,text41,itemtype_key,received_date&filter=text39 eq 'Definitief'`
    ),
  });

  const documentsSource =
    await requestData<DecosZakenResponse<DecosDocumentSource[]>>(
      apiConfigDocuments
    );

  if (documentsSource.status === 'OK') {
    const documentsTransformed = await transformDecosDocumentListResponse(
      sessionID,
      documentsSource.content
    );
    return apiSuccessResult(documentsTransformed);
  }
  return documentsSource;
}

export async function fetchDecosZaakFromSource(
  zaakID: DecosZaakBase['key'],
  includeProperties: boolean = false
) {
  // Fetch the zaak from Decos, this request will return all the fieldNames, no need to specify the ?select= query.
  const apiConfig = getApiConfig('DECOS_API', {
    formatUrl: (config) => {
      return `${config.url}/items/${zaakID}`;
    },
    params: getRequestParamsFromQueryString(
      includeProperties ? '?properties=true' : ''
    ),
    transformResponse: (responseData: DecosZakenResponse) => {
      if (responseData.content) {
        return responseData.content[0];
      }
      return responseData;
    },
  });

  return requestData<DecosZaakSource | null>(apiConfig);
}

type NestedType<T> = T extends DecosZaakTransformer<infer R> ? R : never;

export async function fetchDecosDocument(
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

  return requestData<DocumentDownloadData>(config, authProfileAndToken);
}

export type DecosZaakFrontendTransformOptions<T> = {
  detailPageRoute: string;
  includeFetchDocumentsUrl?: boolean;
  getStepsFN?: (zaak: T) => StatusLineItem[];
};

export function transformDecosZaakFrontend<T extends DecosZaakBase>(
  sessionID: SessionID,
  zaak: T,
  options: DecosZaakFrontendTransformOptions<T>
): DecosZaakFrontend<T> | DecosZaakFrontend<T & WithDateRange> {
  const steps = options.getStepsFN?.(zaak) ?? [];
  const zaakFrontend: DecosZaakFrontend<T> = {
    ...omit(zaak, ['statusDates', 'termijnDates']),
    dateDecisionFormatted: toDateFormatted(zaak.dateDecision),
    dateRequestFormatted: toDateFormatted(zaak.dateRequest),
    steps: options.getStepsFN?.(zaak) ?? [],
    displayStatus: getDisplayStatus(zaak, steps),
    link: {
      to: generatePath(options.detailPageRoute, {
        caseType: slug(zaak.caseType || zaak.itemType, { lower: true }),
        id: zaak.id,
      }),
      title: `Bekijk hoe het met uw aanvraag staat`,
    },
  };

  if (!IS_PRODUCTION) {
    zaakFrontend.fetchSourceRaw = generateFullApiUrlBFF(
      BffEndpoints.DECOS_ZAAK_BY_KEY_RAW,
      [{ key: zaak.key }]
    );
  }

  if (options.includeFetchDocumentsUrl) {
    const idEncrypted = encryptSessionIdWithRouteIdParam(sessionID, zaak.key);
    // Adds an url with encrypted id to the BFF Detail page api for zaken.
    zaakFrontend.fetchDocumentsUrl = generateFullApiUrlBFF(
      BffEndpoints.DECOS_DOCUMENTS_LIST,
      [{ id: idEncrypted }]
    );
  }

  return zaakFrontend;
}

export const forTesting = {
  filterValidDocument,
  getUserKeys: fetchUserKeys,
  getSelectFields,
  fetchZakenByUserKey,
  transformDecosDocumentListResponse,
  transformDecosWorkflowKeysResponse,
  transformDecosZaakResponse,
  transformDecosZakenResponse,
  transformDecosZaakFrontend,
};
