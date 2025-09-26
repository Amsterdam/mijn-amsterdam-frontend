import { fetchBezwaarDetail } from './bezwaren';
import {
  RequestWithQueryParams,
  sendResponse,
  type ResponseAuthenticated,
} from '../../routing/route-helpers';
import { decryptEncryptedRouteParamAndValidateSessionID } from '../shared/decrypt-route-param';

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
