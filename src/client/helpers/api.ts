import { generatePath } from 'react-router';

import type { ApiResponse_DEPRECATED } from '../../universal/helpers/api.ts';
import { BFFApiUrls } from '../apps/bob/config/api.ts';

export function generateBffApiUrl(
  route: keyof typeof BFFApiUrls,
  routeParams?: Record<string, string>
) {
  const url = new URL(BFFApiUrls[route]);
  return `${url.origin}${generatePath(url.pathname, routeParams)}`;
}

export function generateBffApiUrlWithEncryptedPayloadQuery(
  route: keyof typeof BFFApiUrls,
  encryptedPayload: string,
  routeParams?: Record<string, string>,
  payloadParamName = 'payload'
) {
  return `${generateBffApiUrl(route, routeParams)}?${payloadParamName}=${encodeURIComponent(encryptedPayload)}`;
}

export function isLoading(
  apiResponseData?: ApiResponse_DEPRECATED<unknown>,
  profileType?: ProfileType
) {
  if (!apiResponseData) {
    return true;
  }

  if (apiResponseData.status !== 'PRISTINE' || !apiResponseData.isActive) {
    return false;
  }

  const { profileTypes } = apiResponseData;

  if (!profileTypes || profileTypes.length === 0) {
    return true;
  }

  if (!profileType) {
    return true;
  }

  return profileTypes.includes(profileType);
}
