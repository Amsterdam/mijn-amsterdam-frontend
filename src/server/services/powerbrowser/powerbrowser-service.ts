import _chunk from 'lodash.chunk';
import memoizee from 'memoizee';
import { generatePath } from 'react-router';
import slug from 'slugme';

import { hasCaseTypeInFMT_CAPTION } from './powerbrowser-helpers';
import {
  PowerBrowserZaakBase,
  FetchPersoonOrMaatschapIdByUidOptions,
  PBDocumentFields,
  PBRecordField,
  PBZaakRecord,
  PBZaakResultaat,
  PowerBrowserStatusResponse,
  PowerBrowserZaakTransformer,
  SearchRequestResponse,
  PowerBrowserZaakFrontend,
  ZaakStatusDate,
  NestedType,
} from './powerbrowser-types';
import {
  apiErrorResult,
  ApiResponse,
  apiSuccessResult,
} from '../../../universal/helpers/api';
import { dateSort, isDateInPast } from '../../../universal/helpers/date';
import { toDateFormatted } from '../../../universal/helpers/date';
import { entries, omit } from '../../../universal/helpers/utils';
import {
  GenericDocument,
  StatusLineItem,
} from '../../../universal/types/App.types';
import { AuthProfile, AuthProfileAndToken } from '../../auth/auth-types';
import { ONE_HOUR_MS } from '../../config/app';
import { DataRequestConfig } from '../../config/source-api';
import { encryptSessionIdWithRouteIdParam } from '../../helpers/encrypt-decrypt';
import { getFromEnv } from '../../helpers/env';
import {
  createSessionBasedCacheKey,
  getApiConfig,
} from '../../helpers/source-api-helpers';
import { requestData } from '../../helpers/source-api-request';
import { BffEndpoints } from '../../routing/bff-routes';
import { generateFullApiUrlBFF } from '../../routing/route-helpers';
import { DocumentDownloadData } from '../shared/document-download-route-handler';

const TOKEN_VALIDITY_PERIOD = 24 * ONE_HOUR_MS;
const PERCENTAGE_DISTANCE_FROM_EXPIRY = 0.1;

const fetchPowerBrowserToken = memoizee(fetchPowerBrowserToken_, {
  maxAge: TOKEN_VALIDITY_PERIOD,
  preFetch: PERCENTAGE_DISTANCE_FROM_EXPIRY,
  promise: true,
});

type PowerBrowserToken = string;

function fetchPowerBrowserToken_(): Promise<ApiResponse<PowerBrowserToken>> {
  const requestConfig = getApiConfig('POWERBROWSER', {
    formatUrl: ({ url }) => `${url}/Token`,
    responseType: 'text',
    data: {
      apiKey: getFromEnv('BFF_POWERBROWSER_TOKEN_API_KEY'), // Powerbrowser specific api key. Not the same as Enable-U.
    },
  });
  return requestData<PowerBrowserToken>(requestConfig);
}

/** Fetch any data from Powerbrowser by extending a default `dataRequestConfig`. */
async function fetchPowerBrowserData<T>(
  dataRequestConfigSpecific: DataRequestConfig
): Promise<ApiResponse<T>> {
  const tokenResponse = await fetchPowerBrowserToken();
  const dataRequestConfig = getApiConfig('POWERBROWSER', {
    ...dataRequestConfigSpecific,
    headers: {
      Authorization: `Bearer ${tokenResponse.content}`,
    },
  });

  const response = await requestData<T>(dataRequestConfig);

  if (response.status === 'ERROR') {
    fetchPowerBrowserToken.clear();
  }

  return response;
}

function getPersoonOrMaatschapOptions(
  authProfile: Pick<AuthProfile, 'id' | 'profileType'>
): FetchPersoonOrMaatschapIdByUidOptions | null {
  // Set-up the options for the PowerBrowser API request based on the profile type.
  const optionsByProfileType: Record<
    ProfileType,
    FetchPersoonOrMaatschapIdByUidOptions | null
  > = {
    commercial: {
      tableName: 'MAATSCHAP',
      fieldName: 'KVKNUMMER',
      profileID: authProfile.id,
    },
    private: {
      tableName: 'PERSONEN',
      fieldName: 'BURGERSERVICENUMMER',
      profileID: authProfile.id,
    },
    'private-attributes': null,
  };

  return optionsByProfileType[authProfile.profileType];
}

// Returns all PERSONEN or MAATSCHAP records attached to the provided profileID (bsn or kvknummer)
async function fetchPersonenOrMaatschappenIdsByProfileID(
  options: FetchPersoonOrMaatschapIdByUidOptions
): Promise<ApiResponse<string[]>> {
  const requestConfig: DataRequestConfig = {
    formatUrl({ url }) {
      return `${url}/SearchRequest`;
    },
    transformResponse(
      responseData: SearchRequestResponse<typeof options.tableName>
    ) {
      return responseData.records?.map((record) => record.id) ?? [];
    },
    data: {
      query: {
        tableName: options.tableName,
        conditions: [
          {
            fieldName: options.fieldName,
            fieldValue: options.profileID,
          },
        ],
        limit: 100, // This is assumed a safe limit for the search. We don't expect the system to actually have this much PERSONEN records related to the profileID.
      },
    },
  };
  const response = await fetchPowerBrowserData<string[]>(requestConfig);
  if (response.status === 'ERROR') {
    return apiErrorResult(
      response.message || 'Could not get personID for BBVergunning',
      null
    );
  }
  return response;
}

type zaakIdToZaakTransformer = {
  [id: string]: PowerBrowserZaakTransformer;
};
type FilterDef<T> = {
  zaakTransformer: PowerBrowserZaakTransformer;
  filter: (item: T) => boolean;
};
function assignTransformerByFilter<
  T extends { id: string; fields: PBRecordField[] },
>(items: T[], filters: FilterDef<PBRecordField>[]): zaakIdToZaakTransformer {
  const result: ReturnType<typeof assignTransformerByFilter> = {};

  for (const item of items) {
    for (const { zaakTransformer, filter } of Object.values(filters)) {
      if (item.fields.some(filter)) {
        result[item.id] = zaakTransformer;
        break;
      }
    }
  }

  return result;
}

function getFieldValue(
  pbFieldName: PBRecordField['fieldName'],
  pbZaakFields: PBRecordField[]
): string | null {
  const pbField = pbZaakFields.find((field) => field.fieldName === pbFieldName);

  switch (pbFieldName) {
    case 'RESULTAAT_ID':
      return (pbField?.text as PBZaakResultaat) ?? null;
    default:
      return pbField?.fieldValue ?? null;
  }
}

export function isExpired(dateExpiry: string | null, dateNow?: Date) {
  if (!dateExpiry) {
    return false;
  }

  return isDateInPast(dateExpiry, dateNow || new Date());
}

function getDisplayStatus(
  zaak: PowerBrowserZaakBase,
  steps: StatusLineItem[]
): PowerBrowserZaakFrontend['displayStatus'] {
  const lastActiveStep = steps.findLast((step) => step.isActive)
    ?.status as PowerBrowserZaakFrontend['displayStatus'];

  if (lastActiveStep !== 'Verlopen' && zaak.decision) {
    return zaak.decision;
  }

  return lastActiveStep ?? 'Ontvangen';
}

function getZaakResultaat(resultaat: PBZaakResultaat | null) {
  if (resultaat === null) {
    return null;
  }

  const resultaatTransformed: PowerBrowserZaakBase['decision'] = resultaat;

  const resultatenVerleend = [
    'Verleend met overgangsrecht',
    'Verleend zonder overgangsrecht',
    'Verleend',
  ];

  const resultatenNietVerleend = [
    'Geweigerd op basis van Quotum',
    'Geweigerd',
    'Geweigerd met overgangsrecht',
    'Buiten behandeling',
  ];
  const resultatenOverig = ['Ingetrokken'];

  switch (true) {
    case resultatenVerleend.includes(resultaat):
      return 'Verleend';
    case resultatenNietVerleend.includes(resultaat):
      return 'Niet verleend';
    case resultatenOverig.includes(resultaat):
      return 'Ingetrokken';
  }

  return resultaatTransformed;
}

async function fetchZaakAdres(
  zaakId: PBZaakRecord['id']
): Promise<ApiResponse<string | null>> {
  const addressResponse = await fetchPowerBrowserData<string>({
    method: 'post',
    formatUrl({ url }) {
      return `${url}/Link/GFO_ZAKEN/ADRESSEN/Table`;
    },
    data: [zaakId],
    transformResponse(
      data: SearchRequestResponse<'ADRESSEN', PBRecordField<'FMT_CAPTION'>[]>
    ) {
      const address =
        data.records?.[0]?.fields.find((field) => {
          return field.fieldName === 'FMT_CAPTION';
        })?.fieldValue ?? null;

      if (!address) {
        return null;
      }

      // Adds a newline before the postal code to ensure the address is displayed correctly.
      const regExp = /[0-9]{4}[A-Z]{2}/;
      const match = address.match(regExp);

      return match && match.length > 0
        ? address.replace(match[0], `\n${match[0]}`)
        : address;
    },
  });
  return addressResponse;
}

async function fetchZaakStatusDates(
  zaak: Pick<PowerBrowserZaakBase, 'id'>
): Promise<ApiResponse<ZaakStatusDate[] | null>> {
  const statusResponse = await fetchPowerBrowserData<StatusLineItem[]>({
    formatUrl({ url }) {
      return `${url}/Report/RunSavedReport`;
    },
    transformResponse(responseData: PowerBrowserStatusResponse) {
      return responseData.map(({ omschrijving, datum }) => ({
        status: omschrijving,
        datePublished: datum ?? null,
      }));
    },
    data: {
      reportFileName:
        'D:\\Genetics\\PowerForms\\Overzichten\\Wonen\\MijnAmsterdamStatus.gov',
      Parameters: [
        {
          Name: 'GFO_ZAKEN_ID',
          Type: 'String',
          Value: {
            StringValue: `${zaak.id}`,
          },
        },
      ],
    },
  });
  return statusResponse;
}

async function fetchSettledZaakDocuments(
  authProfile: AuthProfile,
  documentNamenMA_PB: PowerBrowserZaakTransformer['transformDoclinks'],
  zaak: Pick<PowerBrowserZaakBase, 'id'>
): Promise<GenericDocument[]> {
  const { status, content } = await fetchDocumentsList(
    authProfile,
    documentNamenMA_PB,
    zaak.id
  );
  if (status === 'OK' && content !== null) {
    return content;
  }
  return [];
}

async function fetchSettledZaakStatusDates(
  zaak: Pick<PowerBrowserZaakBase, 'id'>
): Promise<ZaakStatusDate[]> {
  const { status, content } = await fetchZaakStatusDates(zaak);
  if (status === 'OK' && content !== null) {
    return content;
  }
  return [];
}

async function fetchSettledZaakAdres(
  zaak: Pick<PowerBrowserZaakBase, 'id'>
): Promise<string> {
  const { status, content } = await fetchZaakAdres(zaak.id);
  if (status === 'OK' && content !== null) {
    return content;
  }
  return '';
}

function transformPowerbrowserDocLinksResponse(
  sessionID: SessionID,
  documentNamenMA_PB: PowerBrowserZaakTransformer['transformDoclinks'],
  responseData: SearchRequestResponse<'DOCLINK', PBDocumentFields[]>
): PowerBrowserZaakBase['documents'] {
  type PBDocument = {
    [K in PBDocumentFields['fieldName']]: string;
  };
  return (responseData.records || [])
    .map((documentRecord) => {
      const document = Object.fromEntries(
        documentRecord.fields.map((field) => {
          return [field.fieldName, field.fieldValue];
        })
      ) as PBDocument;
      const titleLower = document.OMSCHRIJVING.toLowerCase();

      const [docTitleTranslated] =
        Object.entries(documentNamenMA_PB).find(
          ([_docTitleMa, docTitlesPB]) => {
            return docTitlesPB.some((docTitlePb) => {
              return titleLower.includes(docTitlePb.toLowerCase());
            });
          }
        ) ?? [];

      if (!docTitleTranslated) {
        return null;
      }

      const docIdEncrypted = encryptSessionIdWithRouteIdParam(
        sessionID,
        String(document.ID)
      );

      const title = docTitleTranslated ?? document.OMSCHRIJVING;

      return {
        id: docIdEncrypted,
        title,
        url: generateFullApiUrlBFF(
          BffEndpoints.POWERBROWSER_DOCUMENT_DOWNLOAD,
          [{ id: docIdEncrypted }]
        ),
        download: title,
        datePublished: document.CREATEDATE,
      };
    })
    .filter((document) => document !== null)
    .sort(dateSort('datePublished', 'desc'));
}

async function fetchDocumentsList(
  authProfile: AuthProfile,
  documentNamenMA_PB: PowerBrowserZaakTransformer['transformDoclinks'],
  zaakId: PowerBrowserZaakBase['id']
): Promise<ApiResponse<PowerBrowserZaakBase['documents']>> {
  const dataRequestConfig: DataRequestConfig = {
    method: 'post',
    formatUrl({ url }) {
      return `${url}/SearchRequest`;
    },
    data: {
      query: {
        tableName: 'DOCLINK',
        conditions: [
          {
            fieldName: 'GFO_ZAKEN_ID',
            fieldValue: zaakId,
          },
          {
            fieldName: 'EXTENSIE',
            fieldValue: '.pdf',
          },
        ],
      },
    },
    transformResponse(responseData) {
      return transformPowerbrowserDocLinksResponse(
        authProfile.sid,
        documentNamenMA_PB,
        responseData
      );
    },
    cacheKey_UNSAFE: createSessionBasedCacheKey(authProfile.sid, zaakId),
  };

  return fetchPowerBrowserData(dataRequestConfig);
}

export async function fetchDocument(
  _authProfileAndToken: AuthProfileAndToken,
  documentId: string
): Promise<ApiResponse<DocumentDownloadData>> {
  const tokenResponse = await fetchPowerBrowserToken();

  if (tokenResponse.status === 'ERROR') {
    return tokenResponse;
  }

  const dataRequestConfig: DataRequestConfig = {
    method: 'get',
    responseType: 'stream',
    formatUrl({ url }) {
      const fullUrl = `${url}${generatePath('/Dms/:id/Pdf', {
        id: documentId,
      })}`;
      return fullUrl;
    },
    transformResponse: (documentResponseData): DocumentDownloadData => {
      return {
        data: documentResponseData,
        mimetype: 'application/pdf',
      };
    },
  };

  const response =
    await fetchPowerBrowserData<DocumentDownloadData>(dataRequestConfig);

  return response;
}

function transformZaakRaw<
  T extends PowerBrowserZaakTransformer,
  PB extends NestedType<T>,
>(zaakTransformer: T, zaakRaw: PBZaakRecord): PB {
  const { result, zaaknummer, dateReceived, dateDecision, dateEnd, ...pbZaak } =
    Object.fromEntries(
      entries(zaakTransformer.transformFields).map(
        ([pbFieldName, desiredName]) => {
          return [desiredName, getFieldValue(pbFieldName, zaakRaw.fields)];
        }
      )
    );

  const decision = getZaakResultaat(result as PBZaakResultaat);
  const isVerleend = decision === 'Verleend';

  const zaak = {
    id: zaakRaw.id,
    identifier: zaaknummer ?? zaakRaw.id,
    caseType: zaakTransformer.caseType,
    title: zaakTransformer.title,

    dateRequest: dateReceived,
    dateDecision: dateDecision,

    // The permit is valid from the date we have a decision.
    dateStart: isVerleend && dateDecision ? dateDecision : '',
    dateEnd: isVerleend && dateEnd ? dateEnd : '',

    decision,
    isVerleend,
    documents: [] as GenericDocument[],

    processed: !!decision,
    isExpired: isExpired(pbZaak.dateEnd, new Date()),

    ...pbZaak,
  };

  return zaak as PB;
}

async function fetchZakenByIds(zaakIds: string[]) {
  if (zaakIds.length === 0) {
    return apiSuccessResult([]);
  }

  const responses = await Promise.all(
    _chunk(zaakIds, 25)
      .map(
        (chunkOfZaakIds) =>
          ({
            method: 'get',
            formatUrl({ url }) {
              return `${url}/record/GFO_ZAKEN/${chunkOfZaakIds.join(',')}`;
            },
            transformResponse(responseData: PBZaakRecord[]) {
              return responseData ?? [];
            },
          }) as DataRequestConfig
      )
      .map(async (requestConfig) =>
        fetchPowerBrowserData<PBZaakRecord[]>(requestConfig)
      )
  );

  if (responses.some((r) => r.status !== 'OK')) {
    return apiErrorResult(
      'Failed to fetch powerbrowser zaken by zaakIds',
      null
    );
  }
  return apiSuccessResult(responses.flatMap((r) => r.content));
}

async function fetchZakenRecords<T extends PowerBrowserZaakTransformer>(
  authProfile: Pick<AuthProfile, 'id' | 'profileType'>,
  zaakTransformers: T[]
): Promise<ApiResponse<[PBZaakRecord, T][]>> {
  const tableOptions = getPersoonOrMaatschapOptions(authProfile);
  if (!tableOptions) {
    return apiErrorResult('Profile type not supported', null);
  }

  const idsResponse =
    await fetchPersonenOrMaatschappenIdsByProfileID(tableOptions);

  if (idsResponse.status !== 'OK') {
    return idsResponse;
  }

  if (!idsResponse.content?.length) {
    return apiSuccessResult([]);
  }

  const zakenSearchResponse = await fetchPowerBrowserData<
    SearchRequestResponse<'GFO_ZAKEN'>
  >({
    formatUrl({ url }) {
      return `${url}/Link/${tableOptions.tableName}/GFO_ZAKEN/Table`;
    },
    data: idsResponse.content,
  });

  if (zakenSearchResponse.status !== 'OK') {
    return zakenSearchResponse;
  }

  const zakenIdToZakentransformer = assignTransformerByFilter(
    zakenSearchResponse.content.records || [],
    zaakTransformers.map((t) => {
      const defaultFetchZaakIdFilter = (pbRecordField: PBRecordField<string>) =>
        hasCaseTypeInFMT_CAPTION(pbRecordField, t.caseType as string);
      return {
        zaakTransformer: t,
        filter: t.fetchZaakIdFilter ?? defaultFetchZaakIdFilter,
      };
    })
  );
  const zakenIds = Object.keys(zakenIdToZakentransformer);
  const zakenResponse = await fetchZakenByIds(zakenIds);

  if (zakenResponse.status !== 'OK') {
    return zakenResponse;
  }

  return apiSuccessResult(
    zakenResponse.content
      .map(
        (zaak) =>
          [zaak, zakenIdToZakentransformer[zaak.id]] as [PBZaakRecord, T]
      )
      .filter(([_zaak, transformer]) => !!transformer)
  );
}

export async function fetchPBZaken<T extends PowerBrowserZaakTransformer>(
  authProfile: AuthProfile,
  zaakTransformers: T[]
): Promise<ApiResponse<NestedType<T>[]>> {
  const zakenResponse = await fetchZakenRecords(authProfile, zaakTransformers);

  if (zakenResponse.status !== 'OK') {
    return zakenResponse;
  }

  const zakenPromise = zakenResponse.content.map(
    async ([zaakRaw, zaakTransformer]) => {
      const zaak = transformZaakRaw(zaakTransformer, zaakRaw);
      const [location, documents, statusDates] = await Promise.all([
        fetchSettledZaakAdres(zaak),
        fetchSettledZaakDocuments(
          authProfile,
          zaakTransformer.transformDoclinks,
          zaak
        ),
        fetchSettledZaakStatusDates(zaak),
      ]);
      return {
        ...zaak,
        location,
        documents,
        statusDates,
      };
    }
  );
  const zaken = await Promise.all(zakenPromise);
  return apiSuccessResult(zaken);
}

export type PBZaakFrontendTransformOptions<T> = {
  detailPageRoute: string;
  getStepsFN?: (zaak: T) => StatusLineItem[];
};

export function transformPBZaakFrontend<T extends PowerBrowserZaakBase>(
  zaak: T,
  options: PBZaakFrontendTransformOptions<T>
): PowerBrowserZaakFrontend<T> {
  const steps = options.getStepsFN?.(zaak) ?? [];
  const zaakFrontend: PowerBrowserZaakFrontend<T> = {
    ...omit(zaak, ['statusDates']),
    dateRequestFormatted: toDateFormatted(zaak.dateRequest) || '-',
    dateDecisionFormatted: toDateFormatted(zaak.dateDecision) || '-',
    dateStartFormatted: toDateFormatted(zaak.dateStart) || '-',
    dateEndFormatted: toDateFormatted(zaak.dateEnd) || '-',

    steps: options.getStepsFN?.(zaak) ?? [],
    displayStatus: getDisplayStatus(zaak, steps),
    link: {
      to: generatePath(options.detailPageRoute, {
        caseType: slug(zaak.caseType, { lower: true }),
        id: zaak.id,
      }),
      title: `Bekijk hoe het met uw aanvraag staat`,
    },
  };
  return zaakFrontend;
}

export const forTesting = {
  fetchPowerBrowserToken_,
  fetchPowerBrowserData,
  fetchPersonenOrMaatschappenIdsByProfileID,
  fetchSettledZaakAdres,
  fetchZaakAdres,
  fetchSettledZaakStatusDates,
  fetchZaakStatusDates,
  fetchZakenRecords,
  fetchZakenByIds,
  fetchDocumentsList,
  fetchSettledZaakDocuments,
  getFieldValue,
  getZaakResultaat,
  getDisplayStatus,
  transformPowerbrowserDocLinksResponse,
  transformZaakRaw,
};
