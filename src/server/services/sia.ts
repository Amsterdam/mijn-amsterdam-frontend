import { LatLngLiteral } from 'leaflet';
import { generatePath } from 'react-router-dom';
import { Chapters } from '../../universal/config';
import { AppRoutes } from '../../universal/config/routes';
import { defaultDateTimeFormat, getFullAddress } from '../../universal/helpers';
import { apiErrorResult, apiSuccessResult } from '../../universal/helpers/api';
import { LinkProps, StatusLineItem } from '../../universal/types/App.types';
import { BFF_MS_API_BASE_URL, getApiConfig } from '../config';
import { requestData } from '../helpers';
import { AuthProfileAndToken } from '../helpers/app';

type StatusStateChoice =
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
const INGEPLAND: StatusStateChoice = 'ingepland';
const REACTIE_GEVRAAGD: StatusStateChoice = 'reaction requested';
const REACTIE_ONTVANGEN: StatusStateChoice = 'reaction received';
const DOORGEZET_NAAR_EXTERN: StatusStateChoice = 'forward to external';

// Choices for the API/Serializer layer. Users that can change the state via the API are only allowed
// to use one of the following choices.
const STATUS_CHOICES_API: Record<StatusStateChoice, string> = {
  [GEMELD]: 'Gemeld',
  [AFWACHTING]: 'In afwachting van behandeling',
  [BEHANDELING]: 'In behandeling',
  [ON_HOLD]: 'On hold',
  [INGEPLAND]: 'Ingepland',
  [AFGEHANDELD]: 'Afgehandeld',
  [GEANNULEERD]: 'Geannuleerd',
  [HEROPEND]: 'Heropend',
  [VERZOEK_TOT_AFHANDELING]: 'Extern: verzoek tot afhandeling',
  [REACTIE_GEVRAAGD]: 'Reactie gevraagd',
  [REACTIE_ONTVANGEN]: 'Reactie ontvangen',
  [DOORGEZET_NAAR_EXTERN]: 'Doorgezet naar extern',
};

type StatusKey = keyof typeof STATUS_CHOICES_API;
type StatusValue = (typeof STATUS_CHOICES_API)[StatusKey];

export interface SIAItem {
  id: string;
  identifier: string;
  // category: string;
  datePublished: string; // DateCreated //
  dateModified: string; // Derive from state update
  dateClosed: string | null; // Derive from state===closed?
  dateIncidentStart: string | null;
  dateIncidentEnd: string | null;
  status: StatusValue;
  description: string;
  // priority: string;
  // deadline: string;
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

interface SignalsSourceData {
  count: number;
  results: SignalPrivate[];
}

function getSignalStatus(sourceItem: SignalPrivate): string {
  return STATUS_CHOICES_API[sourceItem.status.state];
}

function transformSIAData(responseData: SignalsSourceData): SIAItem[] {
  // console.log((responseData.results[0] as any)._links);
  const signals = responseData.results ?? [];
  return signals.map((sourceItem: SignalPrivate) => {
    const dateClosed = '';
    const identifier = sourceItem.id_display;

    return {
      id: String(sourceItem.id),
      identifier,
      // category: sourceItem.category.main,
      datePublished: sourceItem.created_at,
      dateModified: sourceItem.updated_at,
      dateClosed,
      dateIncidentStart: sourceItem.incident_date_start,
      dateIncidentEnd: sourceItem.incident_date_end ?? null,
      status: getSignalStatus(sourceItem),
      // priority: sourceItem.priority,
      // deadline: sourceItem.deadline,
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
    // reporter_email: authProfileAndToken.profile.id,
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
}

interface SiaAttachmentResponse {
  count: number;
  results: SiaAttachmentSource[];
}

export interface SiaAttachment {
  url: string;
  isImage: boolean;
}

function transformSiaAttachmentsResponse(response: SiaAttachmentResponse) {
  if (!Array.isArray(response.results)) {
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

    console.log('response.content', response.content);

    return response;
  }

  return apiErrorResult('Could not get access token', null);
}

export interface SiaSignalHistory {
  identifier: string;
  when: string; // date,
  what: string; // 'CREATE_NOTE'
  action: string; // 'Notitie toegevoegd:',
  description: string; // 'Bijlage toegevoegd door melder: Koelkast_op_straat_bij_DICT.jpeg',
  who: string; // 'Signalen systeem';
  _signal: number; // id of the signal
}

export interface SiaSignalStatusHistory {
  datePublished: string;
  key: StatusKey;
  status: StatusValue;
  description: string;
}

function transformSiaStatusResponse(response: SiaSignalHistory[]) {
  // return response;
  console.log(response);
  return response
    .filter((historyEntry) => historyEntry.what === 'UPDATE_STATUS')
    .map((historyEntry) => {
      return {
        // id: historyEntry.identifier,
        status: historyEntry.action,
        key: historyEntry.what,
        datePublished: historyEntry.when,
        description: historyEntry.description,
        // documents: [],
        // isActive: false,
        // isChecked: true,
      };
    });
}

export async function fetchSignalHistory(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken,
  signalId: string
) {
  const requestConfig = await getSiaRequestConfig(requestID);

  if (requestConfig !== null) {
    requestConfig.url = `${requestConfig.url}${signalId}/history`;
    console.log('url:', requestConfig.url);

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
