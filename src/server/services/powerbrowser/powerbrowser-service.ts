import { isBefore } from 'date-fns/isBefore';
import memoizee from 'memoizee';
import { generatePath } from 'react-router';

import {
  PowerBrowserZaakBase,
  FetchPersoonOrMaatschapIdByUidOptions,
  fieldMap,
  PBDocumentFields,
  PBRecordField,
  PBZaakCompacted,
  PBZaakFields,
  PBZaakRecord,
  PBZaakResultaat,
  PowerBrowserStatusResponse,
  PowerBrowserZaakTransformer,
  SearchRequestResponse,
  PowerBrowserZaakFrontend,
  FetchZaakIdsOptions,
  ZaakStatusDate,
} from './powerbrowser-types';
import {
  apiErrorResult,
  ApiResponse,
  ApiResponse_DEPRECATED,
  apiSuccessResult,
  getSettledResult,
} from '../../../universal/helpers/api';
import { dateSort } from '../../../universal/helpers/date';
import { entries, toDateFormatted } from '../../../universal/helpers/utils';
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
) {
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
): Promise<ApiResponse<string | null>> {
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
  const response = await fetchPowerBrowserData<string | null>(requestConfig);
  if (response.status === 'ERROR') {
    return apiErrorResult(
      response.message || 'Could not get personID for BBVergunning',
      null
    );
  }
  return response;
}

async function fetchZakenIds(
  authProfile: Pick<AuthProfile, 'id' | 'profileType'>,
  options: FetchZaakIdsOptions
): Promise<ApiResponse<string[]>> {
  const tableOptions = getPersoonOrMaatschapOptions(authProfile);
  if (!tableOptions) {
    return apiErrorResult('Profile type not supported', null);
  }
  const persoonIdResponse = await fetchPersoonOrMaatschapIdByUid(tableOptions);

  if (persoonIdResponse.status === 'ERROR') {
    return persoonIdResponse;
  }
  if (persoonIdResponse.status !== 'OK' || !persoonIdResponse.content) {
    return apiSuccessResult([]);
  }

  const requestConfig: DataRequestConfig = {
    formatUrl({ url }) {
      return `${url}/Link/${tableOptions.tableName}/GFO_ZAKEN/Table`;
    },
    transformResponse(responseData: SearchRequestResponse<'GFO_ZAKEN'>) {
      return (
        responseData.records
          ?.filter((pbRecord) => pbRecord.fields.some(options.filter))
          .map((record) => record.id) ?? []
      );
    },
    data: [persoonIdResponse.content],
  };

  return fetchPowerBrowserData<string[]>(requestConfig);
}

function getFieldValue(
  pbFieldName: PBZaakFields['fieldName'],
  pbZaakFields: PBZaakFields[]
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

function transformZaak(zaak: PBZaakRecord): PowerBrowserZaakFrontend {
  const pbZaak = Object.fromEntries(
    entries(fieldMap).map(([pbFieldName, desiredName]) => {
      return [desiredName, getFieldValue(pbFieldName, zaak.fields)];
    })
  ) as PBZaakCompacted;

  const title = 'Vergunning bed & breakfast';
  const decision = getZaakResultaat(pbZaak.result);
  const isVerleend = decision === 'Verleend';
  // The permit is valid from the date we have a decision.
  const dateStart =
    isVerleend && pbZaak.dateDecision ? pbZaak.dateDecision : '';
  const dateEnd = isVerleend && pbZaak.dateEnd ? pbZaak.dateEnd : '';
  const id = zaak.id;

  return {
    caseType: title, // TODO: Move to caller transform
    dateRequest: pbZaak.dateReceived,
    dateRequestFormatted: toDateFormatted(pbZaak.dateReceived),
    dateDecision: pbZaak.dateDecision,
    dateDecisionFormatted: toDateFormatted(pbZaak.dateDecision) ?? '-',
    dateStart,
    dateStartFormatted: toDateFormatted(dateStart) ?? '-',
    dateEnd,
    dateEndFormatted: toDateFormatted(dateEnd) ?? '-',
    decision,
    isVerleend,
    id,
    identifier: pbZaak.zaaknummer ?? zaak.id,
    link: {
      to: '/toeristische-verhuur/vergunning/bed-and-breakfast/126088685', // TODO: Move to caller transform
      title,
    },
    title,
    processed: !!decision,
    isExpired: isExpired(pbZaak.dateEnd, new Date()),

    // Added after initial transform
    location: null, // TODO: Move to caller transform
    displayStatus: 'Ontvangen',
    documents: [],
    steps: [],
    heeftOvergangsRecht: pbZaak.dateReceived
      ? isBefore(
          new Date(pbZaak.dateReceived),
          new Date(DATE_NEW_REGIME_BB_RULES)
        )
      : false,
  };
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
      return responseData?.map(transformZaak) ?? [];
    },
  };

  return fetchPowerBrowserData<PowerBrowserZaakBase[]>(requestConfig);
}

export async function fetchZaken<T extends PowerBrowserZaakBase>(
  authProfile: AuthProfile,
  zaakTransformers: PowerBrowserZaakTransformer<T>[]
): Promise<ApiResponse_DEPRECATED<PowerBrowserZaakBase[] | null>> {
  const zaakTransformer = zaakTransformers[0]; // TODO: Implement for multiple

  const zakenIdsResponse = await fetchZakenIds(authProfile, {
    filter: (pbRecordField) =>
      pbRecordField.fieldName === 'FMT_CAPTION' &&
      !!pbRecordField.text &&
      pbRecordField.text?.includes(zaakTransformer.caseType),
  });
  if (zakenIdsResponse.status !== 'OK') {
    return zakenIdsResponse;
  }

  const zakenResponse = await fetchZakenByIds(zakenIdsResponse.content);
  if (zakenResponse.status !== 'OK') {
    return zakenResponse;
  }

  const zaken = zakenResponse.content;
  const [adresResults, documentsResults, statussesResults] = await Promise.all([
    fetchZakenAdres(zaken),
    fetchZakenDocuments(authProfile, zaken),
    fetchZakenStatusDates(zaken),
  ]);

  return apiSuccessResult(
    zaken.map((zaak, i) => ({
      ...zaak,
      adres: adresResults[i],
      documents: documentsResults[i],
      steps: statussesResults[i],
    }))
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
  fetchZakenIds,
  fetchZakenByIds,
  fetchDocumentsList,
  fetchZakenDocuments,
  getFieldValue,
  getZaakResultaat,
  getZaakStatus,
  transformPowerbrowserLinksResponse,
  transformZaak,
  transformZaakStatusResponse,
};
