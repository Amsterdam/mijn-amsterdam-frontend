import { stat } from 'fs';
import { LatLngLiteral } from 'leaflet';
import { generatePath } from 'react-router-dom';
import { Chapters } from '../../universal/config';
import { AppRoutes } from '../../universal/config/routes';
import {
  dateSort,
  defaultDateTimeFormat,
  getFullAddress,
} from '../../universal/helpers';
import { apiErrorResult, apiSuccessResult } from '../../universal/helpers/api';
import { LinkProps } from '../../universal/types/App.types';
import { getApiConfig } from '../config';
import { requestData } from '../helpers';
import { AuthProfileAndToken } from '../helpers/app';

export type StatusStateChoice =
  | 'm'
  | 'i'
  | 'b'
  | 'h'
  | 'o'
  | 'a'
  // | 'reopened'
  // | 'closure requested'
  | 'ingepland'
  | 'reaction requested'
  | 'reaction received'
  | 'reopen requested';
// | 'ready to send';
// | 'forward to external'

// See also: https://github.com/Amsterdam/signals/blob/main/app/signals/apps/signals/workflow.py
// Internal statusses
const GEMELD: StatusStateChoice = 'm';
const AFWACHTING: StatusStateChoice = 'i';
const BEHANDELING: StatusStateChoice = 'b';
const ON_HOLD: StatusStateChoice = 'h';
const AFGEHANDELD: StatusStateChoice = 'o';
const GEANNULEERD: StatusStateChoice = 'a';
// const HEROPEND: StatusStateChoice = 'reopened';
// const VERZOEK_TOT_AFHANDELING: StatusStateChoice = 'closure requested';
const VERZOEK_TOT_HEROPENEN: StatusStateChoice = 'reopen requested';
const INGEPLAND: StatusStateChoice = 'ingepland';
const REACTIE_GEVRAAGD: StatusStateChoice = 'reaction requested';
const REACTIE_ONTVANGEN: StatusStateChoice = 'reaction received';
// const DOORGEZET_NAAR_EXTERN: StatusStateChoice = 'forward to external';
// const TE_VERZENDEN: StatusStateChoice = 'ready to send';

const MA_OPEN = 'Open';
const MA_CLOSED = 'Afgesloten';
const MA_REPLY_REQUESTED = 'Reactie gevraagd';
const MA_REPLY_RECEIVED = 'Reactie ontvangen';

const MA_STATUS_ALLOWED = [
  MA_OPEN,
  MA_REPLY_REQUESTED,
  MA_REPLY_RECEIVED,
  MA_CLOSED,
];
// Choices for the API/Serializer layer. Users that can change the state via the API are only allowed
// to use one of the following choices.
const STATUS_CHOICES_MA: Record<StatusStateChoice, string> = {
  [GEMELD]: MA_OPEN,
  [AFWACHTING]: MA_OPEN,
  [BEHANDELING]: MA_OPEN,
  [ON_HOLD]: MA_OPEN,
  [INGEPLAND]: MA_OPEN,

  [AFGEHANDELD]: MA_CLOSED,
  [GEANNULEERD]: MA_CLOSED,
  [VERZOEK_TOT_HEROPENEN]: MA_CLOSED,

  [REACTIE_GEVRAAGD]: MA_REPLY_REQUESTED,
  [REACTIE_ONTVANGEN]: MA_REPLY_RECEIVED,

  // [HEROPEND]: 'Heropend', // ??
  // [DOORGEZET_NAAR_EXTERN]: 'Doorgezet naar extern', // ??
  // [VERZOEK_TOT_AFHANDELING]: 'Extern: verzoek tot afhandeling', // ??
  // [TE_VERZENDEN]: 'Extern: te verzenden', // ??
};

type StatusKey = keyof typeof STATUS_CHOICES_MA;
type StatusValue = (typeof STATUS_CHOICES_MA)[StatusKey];

const STATUS_CHOICES_API: Record<StatusValue, StatusKey> = {
  Gemeld: GEMELD,
  'In afwachting van behandeling': AFWACHTING,
  'In behandeling': BEHANDELING,
  'On hold': ON_HOLD,
  Ingepland: INGEPLAND,
  // 'Extern: te verzenden': TE_VERZENDEN,
  Afgehandeld: AFGEHANDELD,
  Geannuleerd: GEANNULEERD,
  // Heropend: HEROPEND,
  // 'Extern: verzoek tot afhandeling': VERZOEK_TOT_AFHANDELING,
  'Verzoek tot heropenen': VERZOEK_TOT_HEROPENEN,
  'Reactie gevraagd': REACTIE_GEVRAAGD,
  'Reactie ontvangen': REACTIE_ONTVANGEN,
  // 'Doorgezet naar extern': DOORGEZET_NAAR_EXTERN,
};

export interface SIAItem {
  id: string;
  identifier: string;
  category: string;
  datePublished: string; // DateCreated //
  dateModified: string; // Derive from state update
  dateClosed: string | null; // Derive from state===closed?
  dateIncidentStart: string | null;
  dateIncidentEnd: string | null;
  status: StatusValue;
  description: string;
  address: string;
  latlon: LatLngLiteral;
  email: string;
  phone: string | null;
  link: LinkProps;
  hasAttachments: boolean;
}

interface Category {
  sub: string;
  sub_slug: string;
  main: string;
  main_slug: string;
  category_url: string;
  departments: string;
  created_by?: string;
  text?: string;
}

interface Geometrie {
  type: string;
  coordinates: [number, number];
}

interface Address {
  stadsdeel: string;
  postcode: string;
  huisletter: string;
  huisnummer: string;
  woonplaats: string;
  openbare_ruimte: string;
  huisnummer_toevoeging: string;
}

interface Status {
  text: string;
  state: StatusStateChoice;
  state_display: string;
  send_email: boolean;
  created_at: string;
}

interface Reporter {
  email: string;
  phone: string;
  sharing_allowed: boolean;
}

interface Location {
  address: Address;
  address_text: string;
  geometrie: Geometrie;
}

export interface SignalPrivate {
  id: string;
  id_display: string;
  signal_id: string;
  category: Category;
  has_attachments: boolean;
  location: Location;
  status: Status;
  reporter: Reporter;
  // priority: string;
  // process_time: string;
  // notes: Note[];
  // type: string;
  // source: string;
  text: string;
  text_extra: string;
  // extra_properties: ExtraProperties[];
  created_at: string;
  updated_at: string;
  incident_date_start: string;
  incident_date_end?: string;
  // time: string;
  // directing_departments: DirectingDepartment[];
}

export interface SignalsSourceData {
  count: number;
  results: SignalPrivate[];
  [key: string]: any;
}

function getSignalStatus(sourceItem: SignalPrivate): string {
  return (
    STATUS_CHOICES_MA[sourceItem.status.state] ??
    sourceItem.status.state_display
  );
}

function transformSIAData(responseData: SignalsSourceData): SIAItem[] {
  const signals = responseData.results ?? [];

  return signals.map((sourceItem: SignalPrivate) => {
    const status = getSignalStatus(sourceItem);
    const dateClosed = status === 'Afgesloten' ? sourceItem.updated_at : '';
    const identifier = sourceItem.id_display;

    return {
      id: String(sourceItem.id),
      identifier,
      category: sourceItem.category.main,
      datePublished: sourceItem.created_at,
      dateModified: sourceItem.updated_at,
      dateClosed,
      dateIncidentStart: sourceItem.incident_date_start,
      dateIncidentEnd: sourceItem.incident_date_end ?? null,
      status,
      description: sourceItem.text,
      address: sourceItem.location.address
        ? getFullAddress(
            {
              straatnaam: sourceItem.location.address.openbare_ruimte,
              woonplaatsNaam: sourceItem.location.address.woonplaats,
              huisletter: sourceItem.location.address.huisletter,
              huisnummer: sourceItem.location.address.huisnummer,
              huisnummertoevoeging:
                sourceItem.location.address.huisnummer_toevoeging,
              postcode: sourceItem.location.address.postcode,
            },
            true
          )
        : 'Onbekend adres',
      latlon: {
        lat: sourceItem.location.geometrie.coordinates[1],
        lng: sourceItem.location.geometrie.coordinates[0],
      },
      email: sourceItem.reporter.email,
      phone: sourceItem.reporter.phone,
      hasAttachments: sourceItem.has_attachments,
      link: {
        to: generatePath(AppRoutes['SIA/DETAIL'], {
          id: sourceItem.id,
        }),
        title: `SIA Melding ${identifier}`,
      },
    };
  });
}

interface TokenResponse {
  access_token: string;
}

async function getAccessToken(requestID: requestID) {
  const data = `grant_type=client_credentials&client_id=${process.env.BFF_SIA_IAM_CLIENT_ID}&client_secret=${process.env.BFF_SIA_IAM_CLIENT_SECRET}`;

  return requestData<TokenResponse>(
    {
      method: 'post',
      url: `${process.env.BFF_SIA_IAM_TOKEN_ENDPOINT}`,
      data,
    },
    requestID
  );
}

async function getSiaRequestConfig(requestID: requestID) {
  const accessTokenResponse = await getAccessToken(requestID);
  if (accessTokenResponse.status === 'OK') {
    return getApiConfig('SIA', {
      headers: {
        Authorization: `Bearer ${accessTokenResponse.content.access_token}`,
        'Content-Type': 'application/json',
      },
    });
  }
  return null;
}

export async function fetchSignals(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const queryParams = {
    contact_details: 'email',
    reporter_email: authProfileAndToken.profile.id,
  };

  const requestConfig = await getSiaRequestConfig(requestID);

  if (requestConfig !== null) {
    const response = await requestData<SIAItem[]>(
      {
        ...requestConfig,
        transformResponse: transformSIAData,
        params: queryParams,
      },
      requestID,
      authProfileAndToken
    );

    return response;
  }

  return apiErrorResult('Could not get access token', null);
}

interface SiaAttachmentSource {
  location: string;
  is_image: boolean;
  created_at: string;
  created_by: string;
  [key: string]: any;
}

export interface SiaAttachmentResponse {
  count: number;
  results: SiaAttachmentSource[];
  [key: string]: any;
}

export interface SiaAttachment {
  url: string;
  isImage: boolean;
}

function transformSiaAttachmentsResponse(response: SiaAttachmentResponse) {
  if (!Array.isArray(response?.results)) {
    return [];
  }
  return response.results.map((attachment) => {
    return {
      url: attachment.location,
      isImage: attachment.is_image,
    };
  });
}

export async function fetchSignalAttachments(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken,
  signalId: string
) {
  const requestConfig = await getSiaRequestConfig(requestID);

  if (requestConfig !== null) {
    requestConfig.url = `${requestConfig.url}${signalId}/attachments`;

    const response = await requestData<SiaAttachment[]>(
      {
        ...requestConfig,
        transformResponse: transformSiaAttachmentsResponse,
      },
      requestID,
      authProfileAndToken
    );

    return response;
  }

  return apiErrorResult('Could not get access token', null);
}

export interface SiaSignalHistory {
  identifier: string;
  when: string; // date,
  what: string; // e.g 'CREATE_NOTE'
  action: string; // e.g 'Notitie toegevoegd:',
  description: string | null; // e.g 'Bijlage toegevoegd door melder: Koelkast_op_straat_bij_DICT.jpeg',
  who: string; // e.g 'Signalen systeem';
  _signal: number; // id of the signal
}

export interface SiaSignalStatusHistory {
  datePublished: string;
  key: StatusKey;
  status: StatusValue;
  description: string;
}

function transformSiaStatusResponse(response: SiaSignalHistory[]) {
  const history = [...response].sort(dateSort('when', 'asc'));

  const transformed = history
    .filter((historyEntry) => historyEntry.what === 'UPDATE_STATUS')
    .map((historyEntry) => {
      // Extract readable status string
      const statusValue = historyEntry.action.split(':')[1] as StatusValue;

      // Find the matching statusKey
      const statusKey = STATUS_CHOICES_API[statusValue.trim()];

      // Translate statusVlaue to one for display and aggregation in MA
      const status = STATUS_CHOICES_MA[statusKey] ?? statusValue;

      return {
        status,
        key: historyEntry.what,
        datePublished: historyEntry.when,
        description:
          statusKey === REACTIE_GEVRAAGD || statusKey === REACTIE_ONTVANGEN
            ? historyEntry.description
            : '',
      } as SiaSignalStatusHistory;
    })
    .filter((historyEntry) => MA_STATUS_ALLOWED.includes(historyEntry.status));

  const statusUpdates: SiaSignalStatusHistory[] = [];

  let prevState: SiaSignalStatusHistory['status'] | '' = '';

  for (const statusEntry of transformed) {
    if (statusEntry.status !== prevState) {
      statusUpdates.push(statusEntry);
    } else {
      // Update state to latest action that represents it
      statusUpdates[statusUpdates.length - 1].datePublished =
        statusEntry.datePublished;
    }
    prevState = statusEntry.status;
  }

  return statusUpdates;
}

export async function fetchSignalHistory(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken,
  signalId: string
) {
  const requestConfig = await getSiaRequestConfig(requestID);

  if (requestConfig !== null) {
    requestConfig.url = `${requestConfig.url}${signalId}/history`;

    const response = await requestData<SiaSignalStatusHistory[]>(
      {
        ...requestConfig,
        transformResponse: transformSiaStatusResponse,
      },
      requestID,
      authProfileAndToken
    );

    return response;
  }

  return apiErrorResult('Could not get access token', null);
}

function createSIANotification(item: SIAItem) {
  let title = '';
  let description = '';

  switch (item.status) {
    default:
      title = `U hebt een melding gedaan`;
      description = `Een melding op ${defaultDateTimeFormat(
        item.datePublished
      )}`;
      break;
  }

  return {
    id: `sia-${item.identifier}-notification`,
    datePublished: item.dateModified,
    chapter: Chapters.SIA,
    title,
    description,
    link: {
      to: item.link.to,
      title: 'Bekijk details',
    },
  };
}

export async function fetchSignalNotifications(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
) {
  return apiSuccessResult([]);
}

export const forTesting = {
  transformSiaAttachmentsResponse,
  transformSiaStatusResponse,
  transformSIAData,
  createSIANotification,
  getSiaRequestConfig,
  getSignalStatus,
  STATUS_CHOICES_MA,
};
