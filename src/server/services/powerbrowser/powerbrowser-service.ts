import memoizee from 'memoizee';
import { generatePath } from 'react-router';

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
  ApiErrorResponse,
  apiErrorResult,
  ApiResponse,
  ApiResponse_DEPRECATED,
  ApiSuccessResponse,
  apiSuccessResult,
  getSettledResult,
} from '../../../universal/helpers/api';
import { dateSort } from '../../../universal/helpers/date';
import { entries } from '../../../universal/helpers/utils';
import {
  GenericDocument,
  StatusLineItem,
} from '../../../universal/types/App.types';
import { AuthProfile, AuthProfileAndToken } from '../../auth/auth-types';
import { ONE_HOUR_MS } from '../../config/app';
import { DataRequestConfig } from '../../config/source-api';
import { encryptSessionIdWithRouteIdParam } from '../../helpers/encrypt-decrypt';
import {
  createSessionBasedCacheKey,
  getApiConfig,
} from '../../helpers/source-api-helpers';
import { requestData } from '../../helpers/source-api-request';
import { BffEndpoints } from '../../routing/bff-routes';
import { generateFullApiUrlBFF } from '../../routing/route-helpers';
import { isExpired } from '../decos/decos-helpers';
import { DocumentDownloadData } from '../shared/document-download-route-handler';
import {
  documentNamesMA,
  documentNamenMA_PB,
} from '../toeristische-verhuur/bed-and-breakfast/bed-and-breakfast-types';

// See also: https://www.amsterdam.nl/wonen-bouwen-verbouwen/woonruimte-verhuren/oude-regels-bed-breakfast/
const DATE_NEW_REGIME_BB_RULES = '2019-01-01';

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
      apiKey: process.env.BFF_POWERBROWSER_TOKEN_API_KEY,
    },
  });
  return requestData<PowerBrowserToken>(requestConfig);
}

/** Fetch any data from Powerbrowser by extending a default `dataRequestConfig`. */
async function fetchPowerBrowserData<T>(
  dataRequestConfigSpecific: DataRequestConfig
): Promise<ApiErrorResponse<null> | ApiSuccessResponse<T>> {
  const tokenResponse = await fetchPowerBrowserToken();
  const dataRequestConfigBase = getApiConfig(
    'POWERBROWSER',
    dataRequestConfigSpecific
  );
  const dataRequestConfig = {
    ...dataRequestConfigBase,
    headers: {
      Authorization: `Bearer ${tokenResponse.content}`,
      ...dataRequestConfigBase.headers,
    },
  };

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

async function fetchPersoonOrMaatschapIdByUid(
  options: FetchPersoonOrMaatschapIdByUidOptions
): Promise<ApiResponse<string>> {
  const requestConfig: DataRequestConfig = {
    formatUrl({ url }) {
      return `${url}/SearchRequest`;
    },
    transformResponse(
      responseData: SearchRequestResponse<typeof options.tableName>
    ) {
      return responseData.records?.[0]?.id ?? null;
    },
    data: {
      query: {
        tableName: options.tableName,
        fieldNames: ['ID', options.fieldName],
        conditions: [
          {
            fieldName: options.fieldName,
            fieldValue: options.profileID,
            operator: 0,
            dataType: 0,
          },
        ],
        limit: 1,
      },
      pageNumber: 0,
    },
  };
  const response = await fetchPowerBrowserData<string>(requestConfig);
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

async function fetchPBZaken<T extends PowerBrowserZaakTransformer>(
  authProfile: Pick<AuthProfile, 'id' | 'profileType'>,
  zaakTransformers: T[]
): Promise<ApiResponse<[PBZaakRecord, T][]>> {
  const tableOptions = getPersoonOrMaatschapOptions(authProfile);
  if (!tableOptions) {
    return apiErrorResult('Profile type not supported', null);
  }

  const persoonIdResponse = await fetchPersoonOrMaatschapIdByUid(tableOptions);
  if (persoonIdResponse.status !== 'OK') {
    return persoonIdResponse;
  }
  if (!persoonIdResponse.content) {
    return apiSuccessResult([]);
  }

  const zakenIdsToZakentransformerResponse =
    await fetchPowerBrowserData<zaakIdToZaakTransformer>({
      formatUrl({ url }) {
        return `${url}/Link/${tableOptions.tableName}/GFO_ZAKEN/Table`;
      },
      transformResponse(responseData: SearchRequestResponse<'GFO_ZAKEN'>) {
        return assignTransformerByFilter(
          responseData.records || [],
          zaakTransformers.map((t) => ({
            zaakTransformer: t,
            filter: t.fetchZaakIdFilter,
          }))
        );
      },
      data: [persoonIdResponse.content],
    });
  if (zakenIdsToZakentransformerResponse.status !== 'OK') {
    return zakenIdsToZakentransformerResponse;
  }
  const zakenIdToZakentransformer = zakenIdsToZakentransformerResponse.content;
  const zakenIds = Object.keys(zakenIdToZakentransformer);

  const zakenResponse = await fetchZakenByIds(zakenIds);
  if (zakenResponse.status !== 'OK') {
    return zakenResponse;
  }

  return apiSuccessResult(
    zakenResponse.content.map(
      (zaak) => [zaak, zakenIdToZakentransformer[zaak.id]] as [PBZaakRecord, T]
    )
  );
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

function getZaakStatus(
  zaak: PowerBrowserZaakFrontend
):
  | PowerBrowserZaakFrontend['displayStatus']
  | PowerBrowserZaakFrontend['decision'] {
  const lastStepStatus = zaak.steps?.findLast((step) => step.isActive)
    ?.status as PowerBrowserZaakFrontend['displayStatus'];

  if (lastStepStatus !== 'Verlopen' && zaak.decision) {
    return zaak.decision;
  }

  return lastStepStatus ?? 'Ontvangen';
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

function transformZaakStatusResponse(
  zaak: PowerBrowserZaakBase,
  statusResponse: PowerBrowserStatusResponse
): StatusLineItem[] {
  function getStatusDate(status: string[]) {
    const datum =
      statusResponse?.find(({ omschrijving }) => status.includes(omschrijving))
        ?.datum ?? null;
    return datum || null;
  }

  const datumInBehandeling = getStatusDate(['In behandeling']) ?? '';
  const dateDecision: string =
    getStatusDate(['Afgehandeld', 'Gereed']) ?? zaak.dateDecision ?? '';

  const datumMeerInformatieDocument = zaak.documents.find((document) => {
    return document.title === documentNamesMA.MEER_INFORMATIE;
  });
  const datumMeerInformatie = datumMeerInformatieDocument?.datePublished ?? '';

  // Ontvangen step is added in the transformZaak function to ensure we always have a status step.
  const statusOntvangen: StatusLineItem = {
    id: 'step-1',
    status: 'Ontvangen',
    datePublished: zaak.dateRequest ?? '',
    isActive: true,
    isChecked: true,
  };

  const isVerlopen = zaak.isExpired;
  const hasInBehandeling = !!datumInBehandeling;
  const hasDecision = !!zaak.decision && !!dateDecision;
  const hasMeerInformatieNodig = !!datumMeerInformatie;
  const isMeerInformatieStepActive =
    hasMeerInformatieNodig && !hasDecision && !hasInBehandeling;

  const statussen = [
    {
      ...statusOntvangen,
      isActive: !datumInBehandeling && !hasDecision && !datumMeerInformatie,
    },
  ];

  if (datumMeerInformatie) {
    const statusMeerInformatie: StatusLineItem = {
      id: 'step-meer-info',
      status: 'Meer informatie nodig',
      datePublished: datumMeerInformatie,
      isActive: isMeerInformatieStepActive,
      isChecked: hasDecision || hasMeerInformatieNodig,
      description: `<p>Wij hebben meer informatie en tijd nodig om uw aanvraag te behandelen.</p><p>Bekijk de <a href="${datumMeerInformatieDocument?.url}">brief</a> voor meer details.</p>`,
    };
    statussen.push(statusMeerInformatie);
  }

  const statusInBehandeling: StatusLineItem = {
    id: 'step-2',
    status: 'In behandeling',
    datePublished: datumInBehandeling,
    isActive: !hasDecision && hasInBehandeling,
    isChecked: hasDecision || hasInBehandeling,
  };

  const statusAfgehandeld: StatusLineItem = {
    id: 'step-3',
    status: 'Afgehandeld',
    datePublished: dateDecision,
    isActive: !isVerlopen && hasDecision,
    isChecked: hasDecision,
  };

  statussen.push(statusInBehandeling, statusAfgehandeld);

  if (isVerlopen) {
    const statusVerlopen: StatusLineItem = {
      id: 'step-5',
      status: 'Verlopen',
      datePublished: zaak.dateEnd ?? '',
      isActive: true,
      isChecked: true,
    };
    statussen.push(statusVerlopen);
  }

  return statussen;
}

async function fetchZaakAdres(
  zaakId: PBZaakRecord['id']
): Promise<ApiResponse_DEPRECATED<string | null>> {
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
): Promise<ApiResponse_DEPRECATED<ZaakStatusDate[] | null>> {
  const statusResponse = await fetchPowerBrowserData<StatusLineItem[]>({
    formatUrl({ url }) {
      return `${url}/Report/RunSavedReport`;
    },
    // TODO: Move the transform to statusSteps to caller transform
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

async function fetchZakenDocuments(
  authProfile: AuthProfile,
  zaken: Pick<PowerBrowserZaakBase, 'id'>[]
): Promise<GenericDocument[][]> {
  const documentResults = await Promise.allSettled(
    zaken.map((zaak) => fetchDocumentsList(authProfile, zaak.id))
  );

  return documentResults
    .map(getSettledResult)
    .map(({ status, content }) =>
      status === 'OK' && content !== null ? content : []
    );
}

async function fetchZakenStatusDates(
  zaken: Pick<PowerBrowserZaakBase, 'id'>[]
): Promise<ZaakStatusDate[][]> {
  const statussenRequests = await Promise.allSettled(
    zaken.map((zaak) => fetchZaakStatusDates(zaak))
  );

  return statussenRequests
    .map(getSettledResult)
    .map(({ status, content }) =>
      status === 'OK' && content !== null ? content : []
    );
  // TODO: Create displayStatus in caller transform:
  // map: displayStatus: getZaakStatus(zaken[i]) ?? 'Onbekend',
}

async function fetchZakenAdres(
  zaken: Pick<PowerBrowserZaakBase, 'id'>[]
): Promise<string[]> {
  const addressResults = await Promise.allSettled(
    zaken.map((zaak) => fetchZaakAdres(zaak.id))
  );
  return addressResults
    .map(getSettledResult)
    .map(({ status, content }) =>
      status === 'OK' && content !== null ? content : ''
    );
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
  const requestConfig: DataRequestConfig = {
    method: 'get',
    formatUrl({ url }) {
      return `${url}/record/GFO_ZAKEN/${zaakIds.join(',')}`;
    },
    transformResponse(responseData: PBZaakRecord[]) {
      return responseData ?? [];
    },
  };

  return fetchPowerBrowserData<PBZaakRecord[]>(requestConfig);
}

export async function fetchZaken<T extends PowerBrowserZaakTransformer>(
  authProfile: AuthProfile,
  zaakTransformers: T[]
): Promise<ApiResponse<NestedType<T>[]>> {
  const zakenResponse = await fetchPBZaken(authProfile, zaakTransformers);
  if (zakenResponse.status !== 'OK') {
    return zakenResponse;
  }

  const zaken = zakenResponse.content.map(([zaak, zaakTransformer]) =>
    transformZaakRaw(zaakTransformer, zaak)
  );

  const [adresResults, documentsResults, statussesResults] = await Promise.all([
    fetchZakenAdres(zaken),
    fetchZakenDocuments(authProfile, zaken),
    fetchZakenStatusDates(zaken),
  ]);

  return apiSuccessResult(
    zaken.map(
      (zaak, i) =>
        ({
          ...zaak,
          location: adresResults[i],
          documents: documentsResults[i],
          steps: statussesResults[i],
        }) as NestedType<T>
    )
  );
}

function transformPowerbrowserLinksResponse(
  sessionID: SessionID,
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
        url: `${generateFullApiUrlBFF(
          BffEndpoints.POWERBROWSER_DOCUMENT_DOWNLOAD
        )}?id=${docIdEncrypted}`,
        download: title,
        datePublished: document.CREATEDATE,
      };
    })
    .filter((document) => document !== null)
    .sort(dateSort('datePublished', 'desc'));
}

async function fetchDocumentsList(
  authProfile: AuthProfile,
  zaakId: PowerBrowserZaakBase['id']
): Promise<ApiResponse_DEPRECATED<PowerBrowserZaakBase['documents'] | null>> {
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
      return transformPowerbrowserLinksResponse(authProfile.sid, responseData);
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

export const forTesting = {
  fetchPowerBrowserToken_,
  fetchPowerBrowserData,
  fetchPersoonOrMaatschapIdByUid,
  fetchZakenAdres,
  fetchZaakAdres,
  fetchZakenStatusDates,
  fetchZaakStatusDates,
  fetchPBZaken,
  fetchZakenByIds,
  fetchDocumentsList,
  fetchZakenDocuments,
  getFieldValue,
  getZaakResultaat,
  getZaakStatus,
  transformPowerbrowserLinksResponse,
  transformZaakRaw,
  transformZaakStatusResponse,
};
