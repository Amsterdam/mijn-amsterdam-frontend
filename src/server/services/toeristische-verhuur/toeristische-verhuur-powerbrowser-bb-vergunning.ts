import { isBefore } from 'date-fns/isBefore';
import memoizee from 'memoizee';
import { generatePath } from 'react-router-dom';

import {
  BBVergunning,
  BBVergunningZaakResult,
  fieldMap,
  PBZaakCompacted,
  PBZaakFields,
  PBZaakRecord,
  PBZaakResultaat,
  SearchRequestResponse,
} from './toeristische-verhuur-types';
import { FeatureToggle } from '../../../universal/config/feature-toggles';
import { AppRoutes } from '../../../universal/config/routes';
import {
  apiErrorResult,
  ApiResponse,
  apiSuccessResult,
  getSettledResult,
} from '../../../universal/helpers/api';
import {
  defaultDateFormat,
  isDateInPast,
} from '../../../universal/helpers/date';
import { entries } from '../../../universal/helpers/utils';
import { StatusLineItem } from '../../../universal/types';
import { AuthProfile, AuthProfileAndToken } from '../../auth/auth-types';
import { DataRequestConfig } from '../../config/source-api';
import { encryptSessionIdWithRouteIdParam } from '../../helpers/encrypt-decrypt';
import { getApiConfig } from '../../helpers/source-api-helpers';
import { requestData } from '../../helpers/source-api-request';
import { BffEndpoints } from '../../routing/bff-routes';
import { generateFullApiUrlBFF } from '../../routing/route-helpers';
import { DocumentDownloadData } from '../shared/document-download-route-handler';

// See also: https://www.amsterdam.nl/wonen-leefomgeving/wonen/bedandbreakfast/oude-regels/
const DATE_NEW_REGIME_BB_RULES = '2019-01-01';

function fetchPowerBrowserToken_(requestID: RequestID) {
  const requestConfig = getApiConfig('POWERBROWSER', {
    formatUrl({ url }) {
      return `${url}/Token`;
    },
    responseType: 'text',
    data: {
      apiKey: process.env.BFF_POWERBROWSER_TOKEN_API_KEY,
    },
  });
  return requestData<string>(requestConfig, requestID);
}

const fetchPowerBrowserToken = memoizee(fetchPowerBrowserToken_);

async function fetchPowerBrowserData<T>(
  requestID: RequestID,
  dataRequestConfigSpecific: DataRequestConfig
) {
  const tokenResponse = await fetchPowerBrowserToken(requestID);
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

  return requestData<T>(dataRequestConfig, requestID);
}

async function fetchPersonIdByUid(
  requestID: RequestID,
  authProfile: AuthProfile
) {
  const requestConfig: DataRequestConfig = {
    formatUrl({ url }) {
      return `${url}/SearchRequest`;
    },
    transformResponse(responseData: SearchRequestResponse<'PERSONEN'>) {
      return responseData.records?.[0]?.id ?? null;
    },
    data: {
      query: {
        tableName: 'PERSONEN',
        fieldNames: ['ID', 'BURGERSERVICENUMMER'],
        conditions: [
          {
            fieldName: 'BURGERSERVICENUMMER',
            fieldValue: authProfile.id,
            operator: 0,
            dataType: 0,
          },
        ],
        limit: 1,
      },
      pageNumber: 0,
    },
  };
  return fetchPowerBrowserData<string>(requestID, requestConfig);
}

async function fetchZaakIds(requestID: RequestID, persoonId: string) {
  const requestConfig: DataRequestConfig = {
    formatUrl({ url }) {
      return `${url}/Link/PERSONEN/GFO_ZAKEN/Table`;
    },
    transformResponse(responseData: SearchRequestResponse<'GFO_ZAKEN'>) {
      return responseData.records.map((record) => record.id);
    },
    data: [persoonId],
  };

  return fetchPowerBrowserData<string[]>(requestID, requestConfig);
}

function getFieldValue(
  pbFieldName: PBZaakFields['fieldName'],
  pbZaakFields: PBZaakFields[]
) {
  const pbField = pbZaakFields.find((field) => field.fieldName === pbFieldName);

  switch (pbFieldName) {
    case 'RESULTAAT_ID':
      return (pbField?.text as PBZaakResultaat) ?? null;
    default:
      return pbField?.fieldValue ?? null;
  }
}

function getZaakStatus(
  zaak: BBVergunning
): BBVergunning['status'] | BBVergunning['result'] {
  if (zaak.dateEnd && isDateInPast(zaak.dateEnd)) {
    return 'Verlopen';
  }
  if (zaak.result) {
    return zaak.result;
  }
  const lastStepStatus = zaak.steps.findLast((step) => step.isActive)
    ?.status as BBVergunning['status'];

  return lastStepStatus ?? 'Ontvangen';
}

function getZaakResultaat(resultaat: PBZaakResultaat | null) {
  if (resultaat === null) {
    return null;
  }

  const resultaatTransformed: BBVergunning['result'] = resultaat;

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

interface PowerBrowserStatus {
  omschrijving: string | 'Ontvangen';
  datum: string;
}

type PowerBrowserStatusResponse = PowerBrowserStatus[];

function getReceivedStatusStep(datePublished: string): StatusLineItem {
  const statusOntvangen: StatusLineItem = {
    id: 'step-1',
    status: 'Ontvangen',
    datePublished,
    isActive: true,
    isChecked: true,
  };

  return statusOntvangen;
}

function transformZaakStatusResponse(
  zaak: BBVergunning,
  statusResponse: PowerBrowserStatusResponse
) {
  function getStatusDate(status: string[]) {
    const datum =
      statusResponse?.find(({ omschrijving }) => status.includes(omschrijving))
        ?.datum ?? null;
    return datum || null;
  }

  const datumInBehandeling = getStatusDate(['In behandeling']) ?? '';
  const dateDecision: string =
    getStatusDate(['Afgehandeld', 'Gereed']) ?? zaak.dateDecision ?? '';

  // Ontvangen step is added in the transformZaak function to ensure we always have a status step.
  const statusOntvangen = zaak.steps[0];

  const statusInBehandeling: StatusLineItem = {
    id: 'step-2',
    status: 'In behandeling',
    datePublished: datumInBehandeling,
    isActive: !dateDecision && !!datumInBehandeling,
    isChecked: !!dateDecision || !!datumInBehandeling,
  };

  const statusAfgehandeld: StatusLineItem = {
    id: 'step-3',
    status: 'Afgehandeld',
    datePublished: dateDecision,
    isActive: !!dateDecision,
    isChecked: !!dateDecision,
  };

  return [
    { ...statusOntvangen, isActive: !datumInBehandeling && !dateDecision },
    statusInBehandeling,
    statusAfgehandeld,
  ];
}

async function fetchZaakAdres(
  requestID: RequestID,
  zaakId: PBZaakRecord['id']
): Promise<ApiResponse<string | null>> {
  const addressResponse = await fetchPowerBrowserData<string>(requestID, {
    method: 'get',
    responseType: 'text',
    formatUrl({ url }) {
      return `${url}/Record/AdresMbtZaakOrLocatie/GFO_ZAKEN/${zaakId}`;
    },
    transformResponse(data) {
      // Adds a newline before the postal code to ensure the address is displayed correctly.
      const regExp = /[0-9]{4}[A-Z]{2}/;
      const match = data.match(regExp);
      return match.length > 0 ? data.replace(match[0], `\n${match[0]}`) : data;
    },
  });
  return addressResponse;
}

async function fetchZaakStatussen(
  requestID: RequestID,
  zaak: BBVergunning
): Promise<ApiResponse<StatusLineItem[] | null>> {
  const statusResponse = await fetchPowerBrowserData<StatusLineItem[]>(
    requestID,
    {
      formatUrl({ url }) {
        return `${url}/Report/RunSavedReport`;
      },
      transformResponse(responseData) {
        return transformZaakStatusResponse(zaak, responseData);
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
    }
  );
  return statusResponse;
}

async function fetchAndMergeZaakStatussen(
  requestID: RequestID,
  zaken: BBVergunning[]
): Promise<BBVergunning[]> {
  const statussenRequests = zaken.map((zaak) => {
    return fetchZaakStatussen(requestID, zaak);
  });
  const statussenResults = await Promise.allSettled(statussenRequests);
  const zakenWithstatussen: BBVergunning[] = [];

  for (let i = 0; i < zaken.length; i++) {
    const zaak: BBVergunning = { ...zaken[i] };
    const statussenResponse = getSettledResult(statussenResults[i]);

    zaak.steps =
      statussenResponse.status === 'OK' && statussenResponse.content !== null
        ? statussenResponse.content
        : zaak.steps;

    zaak.status = getZaakStatus(zaak);

    zakenWithstatussen.push(zaak);
  }
  return zakenWithstatussen;
}

async function fetchAndMergeAdressen(
  requestID: RequestID,
  zaken: BBVergunning[]
) {
  const addressRequests = zaken.map((zaak) => {
    return fetchZaakAdres(requestID, zaak.id);
  });
  const addressResults = await Promise.allSettled(addressRequests);
  const zakenWithAddress: BBVergunning[] = [];

  for (let i = 0; i < zaken.length; i++) {
    const addressResponse = getSettledResult(addressResults[i]);
    const adres =
      addressResponse.status === 'OK' && addressResponse.content !== null
        ? addressResponse.content
        : '';

    const zaak: BBVergunning = { ...zaken[i], adres };

    zakenWithAddress.push(zaak);
  }

  return zakenWithAddress;
}

function isZaakActual({
  result,
  dateEnd,
}: {
  result: BBVergunningZaakResult;
  dateEnd: string | null;
}) {
  if (!result) {
    return true;
  }
  if (result !== 'Verleend') {
    return false;
  }
  return !!dateEnd && !isDateInPast(dateEnd);
}

function transformZaak(sessionID: SessionID, zaak: PBZaakRecord): BBVergunning {
  const pbZaak = Object.fromEntries(
    entries(fieldMap).map(([pbFieldName, desiredName]) => {
      return [desiredName, getFieldValue(pbFieldName, zaak.fields)];
    })
  ) as PBZaakCompacted;

  const title = 'Vergunning bed & breakfast';
  const result = getZaakResultaat(pbZaak.result);
  // The permit is valid from the date we have a decision.
  const dateStart =
    result === 'Verleend' && pbZaak.dateDecision ? pbZaak.dateDecision : '';
  const dateEnd = result === 'Verleend' && pbZaak.dateEnd ? pbZaak.dateEnd : '';
  const id = zaak.id;
  const idEncrypted = encryptSessionIdWithRouteIdParam(sessionID, id);

  return {
    dateReceived: pbZaak.dateReceived,
    dateDecision: pbZaak.dateDecision,
    dateStart,
    dateStartFormatted: dateStart ? defaultDateFormat(dateStart) : '-',
    dateEnd,
    dateEndFormatted: dateEnd ? defaultDateFormat(dateEnd) : '-',
    result,
    id,
    zaaknummer: pbZaak.zaaknummer ?? zaak.id,
    link: {
      to: generatePath(AppRoutes['TOERISTISCHE_VERHUUR/VERGUNNING'], {
        id,
        casetype: 'bed-and-breakfast',
      }),
      title,
    },
    title,
    isActual: isZaakActual({ dateEnd, result }),

    // Added after initial transform
    adres: null,
    status: 'Ontvangen',
    documents: [],
    fetchDocumentsUrl:
      parseInt(id, 10) > 0 && FeatureToggle.bbDocumentDownloadsActive
        ? generateFullApiUrlBFF(
            BffEndpoints.TOERISTISCHE_VERHUUR_BB_DOCUMENT_LIST,
            { id: idEncrypted }
          )
        : null,
    steps: [getReceivedStatusStep(pbZaak.dateReceived ?? '')],
    heeftOvergangsRecht: pbZaak.dateReceived
      ? isBefore(
          new Date(pbZaak.dateReceived),
          new Date(DATE_NEW_REGIME_BB_RULES)
        )
      : false,
  };
}

async function fetchZakenByIds(
  requestID: RequestID,
  sessionID: SessionID,
  zaakIds: string[]
): Promise<ApiResponse<BBVergunning[] | null>> {
  const requestConfig: DataRequestConfig = {
    method: 'get',
    formatUrl({ url }) {
      return `${url}/record/GFO_ZAKEN/${zaakIds.join(',')}`;
    },
    transformResponse(responseData: PBZaakRecord[]) {
      return responseData.map((pbZaak) => transformZaak(sessionID, pbZaak));
    },
  };

  const zakenResponse = await fetchPowerBrowserData<BBVergunning[]>(
    requestID,
    requestConfig
  );

  if (zakenResponse.status === 'OK') {
    const zakenWithAddress = await fetchAndMergeAdressen(
      requestID,
      zakenResponse.content
    );

    const zakenWithStatus = await fetchAndMergeZaakStatussen(
      requestID,
      zakenWithAddress
    );

    return apiSuccessResult(zakenWithStatus);
  }

  return zakenResponse;
}

export async function fetchBBVergunningen(
  requestID: RequestID,
  authProfile: AuthProfile
) {
  const persoonIdResponse = await fetchPersonIdByUid(requestID, authProfile);

  if (persoonIdResponse.status === 'OK' && persoonIdResponse.content) {
    const zakenIdsResponse = await fetchZaakIds(
      requestID,
      persoonIdResponse.content
    );

    if (zakenIdsResponse.status !== 'OK') {
      return zakenIdsResponse;
    }

    if (zakenIdsResponse.content.length) {
      const zakenResponse = await fetchZakenByIds(
        requestID,
        authProfile.sid,
        zakenIdsResponse.content
      );
      return zakenResponse;
    }
  }

  if (persoonIdResponse.status === 'ERROR') {
    return apiErrorResult(
      persoonIdResponse.message || 'Could not get personID for BBVergunning',
      null
    );
  }

  return apiSuccessResult([]);
}

const documentNamenMA_PB = {
  'Besluit toekenning': [
    'Anoniem Besluit BB (brief)',
    'Anoniem Besluit BB met overgangsrecht (brief)',
    'Besluit B&B',
    'Besluit B&B met overgangsrecht',
    'Besluit BB vergunningvrij (brief)',
    'Besluit verlening beslistermijn B&B (Brief)',
  ],
  'Besluit Buiten behandeling': ['Besluit aanvraag B&B niet in behandeling '],
  'Besluit weigering': ['Besluit B&B weigering zonder overgangsrecht'],
  'Besluit instrekking': ['Intrekken vergunning BB (brief)'],
};

interface PowerbrowserLink {
  mainTable: string | 'DOCLINK';
  mainId: number;
  caption: string;
  linkID: number;
  note: string | 'Bijlage';
}

function transformPowerbrowserLinksResponse(
  sessionID: SessionID,
  responseData: PowerbrowserLink[]
) {
  return (
    responseData
      ?.filter(
        (link) =>
          link.mainTable === 'DOCLINK' &&
          link.note === 'Bijlage' &&
          !!link.caption?.toLowerCase().includes('.pdf')
      )
      .map((link) => {
        const docIdEncrypted = encryptSessionIdWithRouteIdParam(
          sessionID,
          String(link.mainId)
        );

        const [docTitleTranslated] =
          Object.entries(documentNamenMA_PB).find(
            ([docTitleMa, docTitlesPB]) => {
              return docTitlesPB.some((docTitlePb) =>
                link.caption.includes(docTitlePb)
              );
            }
          ) ?? [];

        return {
          id: docIdEncrypted,
          title: docTitleTranslated ?? link.caption,
          url: generateFullApiUrlBFF(
            BffEndpoints.TOERISTISCHE_VERHUUR_BB_DOCUMENT_DOWNLOAD,
            { id: docIdEncrypted }
          ),
          download: link.caption,
          datePublished: '',
        };
      }) ?? []
  );
}

export async function fetchBBDocumentsList(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken,
  zaakId: BBVergunning['id']
) {
  const dataRequestConfig: DataRequestConfig = {
    method: 'get',
    formatUrl({ url }) {
      return `${url}/Link/GFO_ZAKEN/${zaakId}`;
    },
    transformResponse(responseData) {
      return transformPowerbrowserLinksResponse(
        authProfileAndToken.profile.sid,
        responseData
      );
    },
  };

  return fetchPowerBrowserData(requestID, dataRequestConfig);
}

export async function fetchBBDocument(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken,
  documentId: string
) {
  const tokenResponse = await fetchPowerBrowserToken(requestID);

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

  return fetchPowerBrowserData<DocumentDownloadData>(
    requestID,
    dataRequestConfig
  );
}
