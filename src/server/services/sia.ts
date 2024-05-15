import { LatLngLiteral } from 'leaflet';
import { generatePath } from 'react-router-dom';
import { Themas } from '../../universal/config';
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
import memoize from 'memoizee';
import qs from 'qs';
import { decrypt, encrypt } from '../../universal/helpers/encrypt-decrypt';

const encryptionKey = String(process.env.BFF_GENERAL_ENCRYPTION_KEY);
const MAX_AGE_MS = 1000 * 60; // 1 minute

export type StatusStateChoice =
  | 'm'
  | 'i'
  | 'b'
  | 'h'
  | 'o'
  | 'a'
  | 'reopened'
  | 'closure requested'
  | 'ingepland'
  | 'reaction requested'
  | 'reaction received'
  | 'reopen requested'
  | 'ready to send'
  | 'forward to external';

// See also: https://github.com/Amsterdam/signals/blob/main/app/signals/apps/signals/workflow.py
// Internal statusses
const GEMELD: StatusStateChoice = 'm';
const AFWACHTING: StatusStateChoice = 'i';
const BEHANDELING: StatusStateChoice = 'b';
const ON_HOLD: StatusStateChoice = 'h';
const AFGEHANDELD: StatusStateChoice = 'o';
const GEANNULEERD: StatusStateChoice = 'a';
const HEROPEND: StatusStateChoice = 'reopened';
const VERZOEK_TOT_AFHANDELING: StatusStateChoice = 'closure requested';
const VERZOEK_TOT_HEROPENEN: StatusStateChoice = 'reopen requested';
const INGEPLAND: StatusStateChoice = 'ingepland';
const REACTIE_GEVRAAGD: StatusStateChoice = 'reaction requested';
const REACTIE_ONTVANGEN: StatusStateChoice = 'reaction received';
const DOORGEZET_NAAR_EXTERN: StatusStateChoice = 'forward to external';
const TE_VERZENDEN: StatusStateChoice = 'ready to send';

const MA_OPEN = 'Open';
const MA_CLOSED = 'Afgesloten';
const MA_REPLY_REQUESTED = 'Vraag aan u verstuurd';
const MA_REPLY_RECEIVED = 'Antwoord van u ontvangen';

type MaStatusOpen = typeof MA_OPEN;
type MaStatusClosed = typeof MA_CLOSED;

const MA_STATUS_ALLOWED = [
  MA_OPEN,
  MA_REPLY_REQUESTED,
  MA_REPLY_RECEIVED,
  MA_CLOSED,
];

const STATUS_DESCRIPTION_EXPLICITLY_SENT_TO_USER: StatusStateChoice[] = [
  REACTIE_GEVRAAGD,
  REACTIE_ONTVANGEN,
  AFGEHANDELD,
  HEROPEND,
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

  [HEROPEND]: MA_OPEN,
  [DOORGEZET_NAAR_EXTERN]: MA_OPEN,
  [VERZOEK_TOT_AFHANDELING]: MA_OPEN,
  [TE_VERZENDEN]: MA_OPEN,
};

type StatusKey = keyof typeof STATUS_CHOICES_MA;
type StatusValue = (typeof STATUS_CHOICES_MA)[StatusKey];

const STATUS_CHOICES_API: Record<StatusValue, StatusKey> = {
  Gemeld: GEMELD,
  'In afwachting van behandeling': AFWACHTING,
  'In behandeling': BEHANDELING,
  'On hold': ON_HOLD,
  Ingepland: INGEPLAND,
  'Extern: te verzenden': TE_VERZENDEN,
  Afgehandeld: AFGEHANDELD,
  Geannuleerd: GEANNULEERD,
  Heropend: HEROPEND,
  'Extern: verzoek tot afhandeling': VERZOEK_TOT_AFHANDELING,
  'Verzoek tot heropenen': VERZOEK_TOT_HEROPENEN,
  'Reactie gevraagd': REACTIE_GEVRAAGD,
  'Reactie ontvangen': REACTIE_ONTVANGEN,
  'Doorgezet naar extern': DOORGEZET_NAAR_EXTERN,
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

function transformSIAData(responseData: SignalsSourceData): SiaResponse {
  const signals = responseData.results ?? [];

  const items = signals.map((sourceItem: SignalPrivate) => {
    const status = getSignalStatus(sourceItem);
    const dateClosed = status === MA_CLOSED ? sourceItem.updated_at : '';
    const identifier = sourceItem.id_display;
    const [signalIdEncrypted] = encrypt(String(sourceItem.id), encryptionKey);
    const route =
      status === MA_CLOSED
        ? AppRoutes['SIA/DETAIL/CLOSED']
        : AppRoutes['SIA/DETAIL/OPEN'];
    return {
      id: signalIdEncrypted,
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
        to: generatePath(route, {
          id: identifier,
        }),
        title: `SIA Melding ${identifier}`,
      },
    };
  });

  return {
    total: responseData.count,
    items,
    pageSize: 50,
  };
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

async function _getSiaRequestConfig(requestID: requestID) {
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

const getSiaRequestConfig = memoize(_getSiaRequestConfig, {
  maxAge: MAX_AGE_MS,
});

interface SiaResponse {
  total: number;
  pageSize: number;
  items: SIAItem[];
}

interface SiaResponseOverview {
  open: SiaResponse | null;
  afgesloten: SiaResponse | null;
}

interface SiaRequestParams {
  page: string;
  pageSize: string;
  status: MaStatusOpen | MaStatusClosed;
}

function createStatusListRequestParamValue(
  status: SiaRequestParams['status']
): StatusStateChoice[] {
  switch (status) {
    case MA_OPEN:
      return Object.entries(STATUS_CHOICES_MA)
        .filter(([k, s]) => s !== MA_CLOSED)
        .map(([k]) => k) as StatusStateChoice[];

    case MA_CLOSED:
      return Object.entries(STATUS_CHOICES_MA)
        .filter(([k, s]) => s === MA_CLOSED)
        .map(([k]) => k) as StatusStateChoice[];
  }
}

export async function fetchSignalsListByStatus(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken,
  params: SiaRequestParams = { status: MA_OPEN, page: '1', pageSize: '20' }
) {
  const statusList: StatusStateChoice[] = createStatusListRequestParamValue(
    params.status
  );

  const queryParams = {
    contact_details: 'email',
    reporter_email: authProfileAndToken.profile.id,
    page: params.page,
    status: statusList,
    page_size: params.pageSize,
    kind: ['signal', 'parent_signal'], // NOTE: Alléén hoofdmeldingen tonen op MA
  };

  const requestConfig = await getSiaRequestConfig(requestID);

  if (requestConfig !== null) {
    const response = await requestData<SiaResponse>(
      {
        ...requestConfig,
        transformResponse: transformSIAData,
        params: queryParams,
        // https://github.com/axios/axios/issues/604#issuecomment-321460450
        paramsSerializer: (params) =>
          qs.stringify(params, { arrayFormat: 'repeat' }),
      },
      requestID,
      authProfileAndToken
    );

    return response;
  }

  return apiErrorResult('Could not get access token', null);
}

export async function fetchSignals(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const [open, afgesloten] = await Promise.all([
    fetchSignalsListByStatus(requestID, authProfileAndToken, {
      status: MA_OPEN,
      page: '1',
      pageSize: '100',
    }),
    fetchSignalsListByStatus(requestID, authProfileAndToken, {
      status: MA_CLOSED,
      page: '1',
      pageSize: '100',
    }),
  ]);

  return apiSuccessResult<SiaResponseOverview>({
    open: open.content,
    afgesloten: afgesloten.content,
  });
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
  signalIdEncrypted: string
) {
  const requestConfig = await getSiaRequestConfig(requestID);

  if (requestConfig !== null) {
    const signalIdDencrypted = decrypt(signalIdEncrypted, encryptionKey);

    requestConfig.url = `${requestConfig.url}${signalIdDencrypted}/attachments`;

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

function isStatusUpdateSentToUser(
  statusKey: StatusStateChoice | null,
  nextEntry?: SiaSignalHistory
) {
  // Statusses we known for sure have a description that needs to be shown.
  const isExplitlyShownToUser = statusKey
    ? STATUS_DESCRIPTION_EXPLICITLY_SENT_TO_USER.includes(statusKey)
    : false;

  // Check if the description of this Entry is also sent by e-mail to the owner of the Melding.
  let isDescriptionOptionallySentToUser = false;

  // If an e-mail is sent to the user a CREATE_NOTE history log action is added with a specific text format.
  // See also: https://github.com/search?q=repo%3AAmsterdam%2Fsignals+path%3A%2F^app\%2Fsignals\%2Fapps\%2Femail_integrations\%2Factions\%2F%2F+e-mail&type=code
  if (!isExplitlyShownToUser && nextEntry) {
    isDescriptionOptionallySentToUser =
      nextEntry.what === 'CREATE_NOTE' &&
      !!(
        nextEntry.description?.includes('e-mail') &&
        nextEntry.description.includes('verzonden') &&
        nextEntry.description.includes('melder')
      );
  }

  return isExplitlyShownToUser || isDescriptionOptionallySentToUser;
}

function transformSiaHistoryLogResponse(response: SiaSignalHistory[]) {
  const history = [...response].sort(dateSort('when', 'asc'));

  const transformed = history
    .map((historyEntry, index, all) => {
      // Try to extract readable status string
      const statusValue = historyEntry.action.split(':')[1] as StatusValue;

      // If we have a status value, find the matching statusKey
      const statusKey = statusValue
        ? STATUS_CHOICES_API[statusValue.trim()]
        : null;

      // Translate statusValue to one for display and aggregation in MA
      const status = statusKey ? STATUS_CHOICES_MA[statusKey] : statusValue;

      const nextEntry = all[index + 1];

      return {
        status,
        key: historyEntry.what,
        datePublished: historyEntry.when,
        description: isStatusUpdateSentToUser(statusKey, nextEntry)
          ? historyEntry.description
          : '',
      } as SiaSignalStatusHistory;
    })
    // Filter out the log entries we want to show on MA
    .filter((historyEntry) => MA_STATUS_ALLOWED.includes(historyEntry.status));

  return transformed;
}

export async function fetchSignalHistory(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken,
  signalIdEncrypted: string
) {
  const requestConfig = await getSiaRequestConfig(requestID);

  if (requestConfig !== null) {
    const signalIdDecrypted = decrypt(signalIdEncrypted, encryptionKey);

    requestConfig.url = `${requestConfig.url}${signalIdDecrypted}/history`;

    const response = await requestData<SiaSignalStatusHistory[]>(
      {
        ...requestConfig,
        transformResponse: transformSiaHistoryLogResponse,
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
    thema: Themas.SIA,
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
  transformSiaHistoryLogResponse,
  transformSIAData,
  createSIANotification,
  getSiaRequestConfig,
  getSignalStatus,
  STATUS_CHOICES_MA,
};
