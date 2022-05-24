import { Chapters } from '../../../universal/config';
import { DataRequestConfig, getApiConfig } from '../../config';
import { AuthProfileAndToken } from '../../helpers/app';
import { fetchGenerated, fetchService } from './api-service';

const translationsJson = JSON.parse(
  process.env.BFF_BELASTINGEN_BSN_TRANSLATIONS || ''
);

function getBsnTranslation(bsnOrKvk: string): string {
  return translationsJson?.[bsnOrKvk] ?? bsnOrKvk;
}

function getConfig(bsnOrKvk: string = ''): DataRequestConfig {
  return getApiConfig('BELASTINGEN', {
    headers: {
      Authorization: `Bearer ${process.env.BFF_BELASTINGEN_BEARER_TOKEN}`,
      subjid: getBsnTranslation(bsnOrKvk),
    },
  });
}

export function fetchBelasting(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
) {
  return fetchService(requestID, getConfig(authProfileAndToken.profile.id));
}

export async function fetchBelastingGenerated(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
) {
  return fetchGenerated(
    requestID,
    getConfig(authProfileAndToken.profile.id),
    Chapters.BELASTINGEN
  );
}
