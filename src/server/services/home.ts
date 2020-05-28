import { fetchBAG, fetchBRP } from './index';
import {
  ApiDependencyErrorResponse,
  apiDependencyError,
} from '../../universal/helpers';

export type HOMEResponseData =
  | ResolvedType<ReturnType<typeof fetchBAG>>
  | ApiDependencyErrorResponse;

export async function fetchHOME(sessionID: SessionID, samlToken: string) {
  const BRP = await fetchBRP(sessionID, samlToken);

  let HOME: HOMEResponseData;

  if (BRP.status === 'OK') {
    HOME = await fetchBAG(sessionID, samlToken, BRP.content.adres);
  } else {
    HOME = apiDependencyError({ BRP });
  }

  return HOME;
}
