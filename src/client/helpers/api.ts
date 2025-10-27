import { generatePath } from 'react-router';

import { BFFApiUrls } from '../config/api';

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
