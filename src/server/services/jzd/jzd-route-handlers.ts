import type { Request } from 'express';

import { ZORGNED_JZD_API_CONFIG_KEY } from './wmo/wmo-config.ts';
import type { AuthProfileAndToken } from '../../auth/auth-types.ts';
import {
  sendResponse,
  type ResponseAuthenticated,
} from '../../routing/route-helpers.ts';
import {
  fetchAanvragenRaw,
  fetchAllDocumentsRaw,
  fetchDocument,
} from '../zorgned/zorgned-service.ts';

export async function fetchZorgnedDocumentWMO(
  authProfileAndToken: AuthProfileAndToken,
  documentId: string
) {
  const response = fetchDocument(
    authProfileAndToken.profile.id,
    ZORGNED_JZD_API_CONFIG_KEY,
    documentId
  );
  return response;
}

export async function fetchZorgnedDocumentsWMO(
  _req: Request,
  res: ResponseAuthenticated
) {
  const response = await fetchAllDocumentsRaw(res.locals.userID, {
    zorgnedApiConfigKey: ZORGNED_JZD_API_CONFIG_KEY,
  });

  return sendResponse(res, response);
}

export async function fetchZorgnedAanvragenWMO(
  _req: Request,
  res: ResponseAuthenticated
) {
  const response = await fetchAanvragenRaw(res.locals.userID, {
    zorgnedApiConfigKey: ZORGNED_JZD_API_CONFIG_KEY,
  });

  return sendResponse(res, response);
}
