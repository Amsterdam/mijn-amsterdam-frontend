import { generatePath } from 'react-router-dom';

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
  routeParams?: Record<string, string>
) {
  return `${generateBffApiUrl(route, routeParams)}?payload=${encodeURIComponent(encryptedPayload)}`;
}
