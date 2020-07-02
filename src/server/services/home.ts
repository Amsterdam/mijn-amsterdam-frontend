import { fetchBAG, fetchBRP } from './index';
import { apiSuccesResult } from '../../universal/helpers/api';
import {
  ApiDependencyErrorResponse,
  apiDependencyError,
  isMokum,
} from '../../universal/helpers';

export type HOMEResponseData =
  | ResolvedType<ReturnType<typeof fetchBAG>>
  | ApiDependencyErrorResponse;

export async function fetchHOME(sessionID: SessionID, samlToken: string) {
  const BRP = await fetchBRP(sessionID, samlToken);

  let HOME: HOMEResponseData;

  if (BRP.status === 'OK' && isMokum(BRP.content)) {
    HOME = await fetchBAG(sessionID, samlToken, BRP.content.adres);
  } else if (BRP.status === 'OK' && !isMokum(BRP.content)) {
    HOME = apiSuccesResult({
      latlng: null,
    });
  } else {
    HOME = apiDependencyError({ BRP });
  }

  return HOME;
}
