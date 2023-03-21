import { LatLngLiteral, LatLngTuple } from 'leaflet';
import { generatePath } from 'react-router-dom';
import { Chapters } from '../../universal/config';
import { AppRoutes } from '../../universal/config/routes';
import { defaultDateTimeFormat } from '../../universal/helpers';
import { apiSuccessResult } from '../../universal/helpers/api';
import { LinkProps } from '../../universal/types/App.types';
import { getApiConfig } from '../config';
import { requestData } from '../helpers';
import { AuthProfileAndToken } from '../helpers/app';

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
  priority: string;
  deadline: string;
  address: string;
  latlon: LatLngLiteral;
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
  priority: string; // .priority.priority
  deadline: string; // .category.deadline
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
      priority: sourceItem.priority,
      deadline: sourceItem.deadline,
      description: sourceItem.description,
      address: sourceItem.address,
      latlon: { lat: sourceItem.latlon[0], lng: sourceItem.latlon[1] },
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
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const response = await requestData<SIAItem[]>(
    getApiConfig('SIA', {
      transformResponse: transformSIAData,
    }),
    requestID,
    authProfileAndToken
  );

  return response;
}

function createSIANotification(item: SIAItem) {
  let title = '';
  let description = '';

  switch (item.status) {
    default:
      title = `U hebt een melding gedaan`;
      description = `Een melding inde categorie ${
        item.category
      } op ${defaultDateTimeFormat(item.datePublished)}`;
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

export async function fetchSIANotifications(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const SIA = await fetchSIA(requestID, authProfileAndToken);
  if (SIA.status === 'OK') {
    return apiSuccessResult({
      notifications: SIA.content.map(createSIANotification),
    });
  }
  return SIA;
}
