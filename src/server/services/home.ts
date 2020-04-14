import { fetchBAG, fetchBRP } from './index';
import { ApiUnknownResponse, apiUnknownResult } from '../../universal/helpers';

export type HOMEResponseData =
  | ResolvedType<ReturnType<typeof fetchBAG>>
  | ApiUnknownResponse;

export async function fetchHOME(sessionID: SessionID) {
  const BRP = await fetchBRP();

  let HOMEresponse: HOMEResponseData = apiUnknownResult(
    'De aanvraag voor BAG data kon niet worden gemaakt. BRP data is niet beschikbaar.'
  );

  if (BRP.status === 'success') {
    const BAG = await fetchBAG(BRP.content.adres);
    HOMEresponse = BAG;
  }

  return HOMEresponse;
}
