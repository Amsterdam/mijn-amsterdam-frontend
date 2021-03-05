import {
  apiDependencyError,
  apiSuccesResult,
} from '../../universal/helpers/api';
import { getApiConfig } from '../config';
import { requestData } from '../helpers';
import { LinkProps } from '../../universal/types/App.types';
import { LatLngTuple } from 'leaflet';
import { generatePath } from 'react-router-dom';
import { AppRoutes } from '../../universal/config/routes';

export interface SIAItem {
  identifier: string;
  category: string;
  datePublished: string;
  dateModified: string;
  dateClosed: string;
  dateSubject: string;
  description: string;
  email: string;
  phone: string;
  photos: string[];
  status: string;
  link: LinkProps;
  latlng: LatLngTuple;
}

interface SIASourceItem {
  categorie: string;
  datum: string;
  status: string;
  omschrijving: string;
  kenmerk: string;
  locatie: LatLngTuple;
  email: string;
  telefoonnummer: string;
  fotos: string[];
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
      identifier: sourceItem.kenmerk,
      category: sourceItem.categorie,
      datePublished: sourceItem.datum,
      dateSubject: sourceItem.datum,
      dateModified: sourceItem.datum,
      dateClosed: sourceItem.datum,
      description: sourceItem.omschrijving,
      status: sourceItem.status,
      latlon: sourceItem.locatie,
      email: sourceItem.email,
      phone: sourceItem.telefoonnummer,
      photos: sourceItem.fotos,
      latlng: sourceItem.locatie,
      link: {
        to: generatePath(AppRoutes['SIA/DETAIL'], { id: sourceItem.kenmerk }),
        title: `SIA Melding ${sourceItem.kenmerk}`,
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
