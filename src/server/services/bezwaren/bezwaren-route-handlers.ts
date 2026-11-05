import type { RequestWithQueryParams } from '../../routing/route-helpers.ts';
import {
  type ResponseAuthenticated,
  sendResponse,
} from '../../routing/route-helpers.ts';
import { decryptEncryptedRouteParamAndValidateSessionID } from '../shared/decrypt-route-param.ts';
import { fetchBezwaarDetail } from './bezwaren.ts';

export async function handleFetchBezwaarDetail(
  req: RequestWithQueryParams<{ id: string }>,
  res: ResponseAuthenticated
) {
  const decryptResult = decryptEncryptedRouteParamAndValidateSessionID(
    req.query.id,
    res.locals.authProfileAndToken
  );

  if (decryptResult.status === 'ERROR') {
    return sendResponse(res, decryptResult);
  }

  if (decryptResult.status === 'OK') {
    const response = await fetchBezwaarDetail(
      res.locals.authProfileAndToken,
      decryptResult.content
    );

    return sendResponse(res, response);
  }
}
