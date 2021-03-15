import { LatLngTuple } from 'leaflet';
import { generatePath } from 'react-router-dom';
import { AppRoutes } from '../../universal/config/routes';
import {
  apiDependencyError,
  apiSuccesResult,
} from '../../universal/helpers/api';
import { LinkProps } from '../../universal/types/App.types';
import { getApiConfig } from '../config';
import { requestData } from '../helpers';

export interface SIAItem {
  identifier: string;
  category: string;
  datePublished: string; // DateCreated //
  dateModified: string; // Derive from state update
  dateClosed: string | null; // Derive from state===closed?
  dateIncidentStart: string | null;
  dateIncidentEnd: string | null;
  status: SiaSourceState;
  description: string;
  address: string;
  latlon: LatLngTuple;
  email: string;
  phone: string | null;
  link: LinkProps;
  attachments: string[];
}

type SiaSourceState = 'Afgesloten' | 'Ingepland' | 'Gemeld';

interface SIASourceItem {
  category: string; // .category.sub ?
  datePublished: string; // .created_at
  dateModified: string; // .status.created_at ???
  dateClosed: string; // .status.state === done + status.created_at ???
  dateIncidentStart: string | null; // .incident_date_start
  dateIncidentEnd: string | null; // .incident_date_end
  status: SiaSourceState; // /status.state
  description: string; // .text
  identifier: string;
  address: string; // .location.address_text
  latlon: LatLngTuple;
  email: string; // .reporter.email
  phone: string | null; // .reporter.phone
  attachments: string[]; // .has_attachments + api /attachments/{id} call
}

interface SIASourceData {
  status: 'OK' | 'ERROR';
  content?: SIASourceItem[];
  message?: string;
}

// function transformSIANotifications(notifications?: MyNotification[]) {
//   const notificationsTransformed = Array.isArray(notifications)
//     ? notifications.map((notification) => ({
//         ...notification,
//         chapter: Chapters.SIA,
//       }))
//     : [];

//   return notificationsTransformed;
// }

function transformSIAData(responseData: SIASourceData): SIAItem[] {
  const sia = responseData?.content || [];
  return sia.map((sourceItem) => {
    return {
      identifier: sourceItem.identifier,
      category: sourceItem.category,
      datePublished: sourceItem.datePublished,
      dateModified: sourceItem.dateModified,
      dateClosed: sourceItem.dateClosed,
      dateIncidentStart: sourceItem.dateIncidentStart,
      dateIncidentEnd: sourceItem.dateIncidentEnd,
      status: sourceItem.status,
      description: sourceItem.description,
      address: sourceItem.address,
      latlon: sourceItem.latlon,
      email: sourceItem.email,
      phone: sourceItem.phone,
      attachments: sourceItem.attachments,
      link: {
        to: generatePath(AppRoutes['SIA/DETAIL'], {
          id: sourceItem.identifier,
        }),
        title: `SIA Melding ${sourceItem.identifier}`,
      },
    };
  });
}

export async function fetchSIA(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>
) {
  const response = await requestData<SIAItem[]>(
    getApiConfig('SIA', {
      transformResponse: transformSIAData,
    }),
    sessionID,
    passthroughRequestHeaders
  );

  return response;
}

export async function fetchSIAGenerated(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>
) {
  const SIA = await fetchSIA(sessionID, passthroughRequestHeaders);
  if (SIA.status === 'OK') {
    return apiSuccesResult({
      notifications: [],
    });
  }
  return apiDependencyError({ SIA });
}
