import { Request } from 'express';

import { AuthProfileAndToken } from '../../auth/auth-types';
import {
  sendResponse,
  type ResponseAuthenticated,
} from '../../routing/route-helpers';
import { fetchAllDocuments, fetchDocument } from '../zorgned/zorgned-service';

const ZORGNED_JZD_API_CONFIG_KEY = 'ZORGNED_JZD';

export async function fetchZorgnedJZDDocument(
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

export async function fetchZorgnedJZDDocuments(
  req: Request,
  res: ResponseAuthenticated
) {
  const response = await fetchAllDocuments(res.locals.userID, {
    zorgnedApiConfigKey: ZORGNED_JZD_API_CONFIG_KEY,
  });

  return sendResponse(res, response);
}
