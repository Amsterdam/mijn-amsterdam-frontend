import memoizee from 'memoizee';
import { generatePath } from 'react-router-dom';
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
import {
  GenericDocument,
  StatusLineItem,
  ZaakDetail,
} from '../../../universal/types';
import { AuthProfile, AuthProfileAndToken } from '../../auth/auth-types';
import { DataRequestConfig } from '../../config/source-api';
import { getApiConfig } from '../../helpers/source-api-helpers';
import { requestData } from '../../helpers/source-api-request';
import { DocumentDownloadData } from '../shared/document-download-route-handler';

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

type PBRecordField<K extends string = string> = {
  fieldName: K;
  fieldValue?: string;
  text?: string;
};

type PBRecord<T, F extends PBRecordField[] = PBRecordField[]> = {
  fields: F;
  fmtCpn: string;
  id: string;
  mainTableName: T;
};

type SearchRequestResponse<
  T extends string,
  F extends PBRecordField[] = PBRecordField[],
> = {
  mainTableName: T;
  records: PBRecord<T, F>[];
};

async function fetchPowerBrowserData<T extends unknown>(
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

async function getZaakIds(requestID: RequestID, persoonId: string) {
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

type PBZaakFields =
  | PBRecordField<'ZAAK_IDENTIFICATIE'>
  // | PBRecordField<'CREATEDATE'>
  | PBRecordField<'STARTDATUM'>
  | PBRecordField<'EINDDATUM'>
  | PBRecordField<'INGANGSDATUM'>
  | PBRecordField<'DATUM_TOT'>
  | PBRecordField<'RESULTAAT_ID'>;

type PBZaakRecord = PBRecord<'GFO_ZAKEN', PBZaakFields[]>;

type BBVergunningZaakStatus =
  | 'Ontvangen'
  | 'In behandeling'
  | 'Afgehandeld'
  | 'Verlopen'
  | null;
type BBVergunningZaakResult =
  | 'Verleend'
  | 'Niet verleend'
  | 'Ingetrokken'
  | null;

export interface BBVergunning extends ZaakDetail {
  aanvrager: string | null;
  heeftOvergangsRecht: boolean;
  adres: string | null;
  dateReceived: string | null;
  dateDecision: string | null;
  dateStart: string;
  dateStartFormatted: string | null;
  dateEnd: string | null;
  dateEndFormatted: string | null;
  eigenaar: string | null;
  isActual: boolean;
  result: BBVergunningZaakResult;
  status: BBVergunningZaakStatus | BBVergunningZaakResult;
  zaaknummer: string;
  documents: GenericDocument[];
  title: 'Vergunning bed & breakfast';
}

const fieldMap: Record<PBZaakFields['fieldName'], string> = {
  ZAAK_IDENTIFICATIE: 'zaaknummer',
  EINDDATUM: 'dateDecision',
  INGANGSDATUM: 'dateReceived',
  DATUM_TOT: 'dateEnd',
  RESULTAAT_ID: 'result',
  STARTDATUM: 'dateStart',
};

type PBZaakStatus =
  | string
  | 'Gereed'
  | 'Intake'
  | 'In behandeling'
  | 'Geaccepteerd'
  | 'Afgehandeld'
  | 'Toetsen volledigheid'
  | 'Controle bezoek';

type PBZaakResultaat =
  | null
  // | 'Niet van toepassing'
  // | 'Buiten behandeling'
  | 'Geweigerd'
  | 'Geweigerd op basis van Quotum'
  | 'Verleend met overgangsrecht'
  | 'Verleend zonder overgangsrecht'
  | 'Verleend'
  | 'Ingetrokken';

type PBZaakCompacted = {
  zaaknummer: string | null;
  dateStart: string | null;
  dateReceived: string | null;
  dateDecision: string | null;
  dateEnd: string | null;
  result: PBZaakResultaat | null;
  status: PBZaakStatus | null;
};

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

  let resultaatTransformed: BBVergunning['result'] = null;

  const resultatenVerleend = [
    'Verleend met overgangsrecht',
    'Verleend zonder overgangsrecht',
    'Verleend',
  ];
  const resultatenNietVerleend = ['Geweigerd op basis van Quotum', 'Geweigerd'];
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
    return datum ? defaultDateFormat(datum) : null;
  }

  let datumInBehandeling = getStatusDate(['In behandeling']) ?? '';
  let dateDecision: string =
    getStatusDate(['Afgehandeld', 'Gereed']) ?? zaak.dateDecision ?? '';

  // Ontvangen step is added in the transformZaak function to ensure we always have a status step.
  const statusOntvangen = zaak.steps[0];

  const statusInBehandeling: StatusLineItem = {
    id: 'step-2',
    status: 'In behandeling',
    datePublished: datumInBehandeling,
    isActive: !dateDecision,
    isChecked: !!(datumInBehandeling || dateDecision),
  };

  const statusAfgehandeld: StatusLineItem = {
    id: 'step-3',
    status: 'Afgehandeld',
    datePublished: dateDecision,
    isActive: !!dateDecision,
    isChecked: !!dateDecision,
  };

  return [
    { ...statusOntvangen, isActive: false },
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
      return data;
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

function transformZaak(zaak: PBZaakRecord): BBVergunning {
  const pbZaak = Object.fromEntries(
    entries(fieldMap).map(([pbFieldName, desiredName]) => {
      return [desiredName, getFieldValue(pbFieldName, zaak.fields)];
    })
  ) as PBZaakCompacted;

  const title = 'Vergunning bed & breakfast';
  const dateStart = pbZaak.dateStart ?? pbZaak.dateReceived ?? '';
  const dateEnd = pbZaak.dateEnd;
  const id = zaak.id;
  const result = getZaakResultaat(pbZaak.result);

  return {
    dateReceived: pbZaak.dateReceived,
    dateDecision: pbZaak.dateDecision,
    dateStart,
    dateStartFormatted: dateStart ? defaultDateFormat(dateStart) : null,
    dateEnd,
    dateEndFormatted: dateEnd ? defaultDateFormat(dateEnd) : null,
    result,
    id,
    zaaknummer: pbZaak.zaaknummer ?? zaak.id,
    link: {
      to: generatePath(AppRoutes['TOERISTISCHE_VERHUUR/VERGUNNING/BB'], { id }),
      title,
    },
    eigenaar: '',
    aanvrager: '',
    title,
    isActual: isZaakActual({ dateEnd, result }),

    // Added after initial transform
    adres: null,
    status: 'Ontvangen',
    documents: [],
    steps: [getReceivedStatusStep(dateStart)],
    heeftOvergangsRecht: pbZaak.result?.includes('met overgangsrecht') ?? false,
  };
}

async function fetchZakenByIds(
  requestID: RequestID,
  zaakIds: string[]
): Promise<ApiResponse<BBVergunning[] | null>> {
  const requestConfig: DataRequestConfig = {
    method: 'get',
    formatUrl({ url }) {
      return `${url}/record/GFO_ZAKEN/${zaakIds.join(',')}`;
    },
    transformResponse(responseData: PBZaakRecord[]) {
      return responseData.map(transformZaak);
    },
  };

  const zakenResponse = await fetchPowerBrowserData<BBVergunning[]>(
    requestID,
    requestConfig
  );

  if (zakenResponse.status === 'OK') {
    console.log('zakenResponse:', zakenResponse.content.length);
    const zakenWithAddress = await fetchAndMergeAdressen(
      requestID,
      zakenResponse.content
    );

    console.log('zakenResponse:', zakenWithAddress.length);
    const zakenWithStatus = await fetchAndMergeZaakStatussen(
      requestID,
      zakenWithAddress
    );
    console.log('zakenResponse:', zakenWithAddress);

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
    const zakenIdsResponse = await getZaakIds(
      requestID,
      persoonIdResponse.content
    );

    if (zakenIdsResponse.status !== 'OK') {
      return zakenIdsResponse;
    }

    const zakenResponse = await fetchZakenByIds(
      requestID,
      zakenIdsResponse.content
    );
    return zakenResponse;
  }

  return apiErrorResult(
    persoonIdResponse.status === 'ERROR'
      ? persoonIdResponse.message
      : 'Could not get personID for BBVergunning',
    null
  );
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

  const dataRequestConfigBase = getApiConfig('POWERBROWSER');
  const dataRequestConfig: DataRequestConfig = {
    ...dataRequestConfigBase,
    url:
      dataRequestConfigBase.url +
      generatePath('/Dms/:id/Pdf', {
        id: documentId,
      }),
    responseType: 'stream',
    headers: {
      Authorization: `Bearer ${tokenResponse.content}`,
      ...dataRequestConfigBase.headers,
    },
    transformResponse: (documentResponseData) => {
      return {
        data: documentResponseData,
      };
    },
  };

  return requestData<DocumentDownloadData>(
    dataRequestConfig,
    requestID,
    authProfileAndToken
  );
}
