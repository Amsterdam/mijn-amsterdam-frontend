import type { Request } from 'express';
import { generatePath, matchPath } from 'react-router-dom';
import { BFF_API_BASE_URL } from '../config/app';
import { PUBLIC_BFF_ENDPOINTS } from './bff-routes';

export function queryParams<T extends Record<string, any>>(req: Request) {
  return req.query as T;
}

export function isPublicEndpoint(pathRequested: string) {
  return PUBLIC_BFF_ENDPOINTS.some((pathPublic) => {
    return !!matchPath(pathPublic, {
      path: pathRequested,
    });
  });
}

export function isProtectedRoute(pathRequested: string) {
  // NOT A PUBLIC ENDPOINT
  return !isPublicEndpoint(pathRequested);
}

/** Helper for prepending a route with a baseUrl and optionally interpolating route parameters.
 *
 * # Params
 * | path: Path you want to prepend or interpolate the params into.
 * | params: Optional value to interpolate into the url parameters.
 * | baseUrl: Value that will be the base of the route (default value: `BFF_API_BASE_URL`)
 */
export function generateFullApiUrlBFF(
  path: string,
  params?: Record<string, string>,
  baseUrl: string = BFF_API_BASE_URL
) {
  return `${baseUrl}${generatePath(path, params)}`;
}
