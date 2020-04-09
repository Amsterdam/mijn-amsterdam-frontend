import { dataCache, fetchAFVAL, fetchBAG, fetchBRP } from './index';
import { ApiUnknownResponse, apiUnknownResult } from '../../universal/helpers';

type BAGResponseData =
  | ResolvedType<ReturnType<typeof fetchBAG>>
  | ApiUnknownResponse;

type AFVALResponseData =
  | ResolvedType<ReturnType<typeof fetchAFVAL>>
  | ApiUnknownResponse;

export async function loadServicesRelated(sessionID: SessionID) {
  const promiseBRP = fetchBRP();
  const BRP: ResolvedType<typeof promiseBRP> = await dataCache.add(
    sessionID,
    'BRP',
    promiseBRP
  );

  let BAGresponse: BAGResponseData = apiUnknownResult(
    'De aanvraag voor BAG data kon niet worden gemaakt. BRP data is niet beschikbaar.'
  );

  if (BRP.status === 'success') {
    const promiseBAG = fetchBAG(BRP.content.adres);
    const BAG: ResolvedType<typeof promiseBAG> = await dataCache.add(
      sessionID,
      'BAG',
      promiseBAG
    );
    BAGresponse = BAG;
  }

  let AFVALresponse: AFVALResponseData = apiUnknownResult(
    'De aanvraag voor AFVAL data kon niet worden gemaakt. BAG locatie data is niet beschikbaar.'
  );

  if (BAGresponse.status === 'success') {
    const promiseAFVAL = fetchAFVAL(BAGresponse.content.latlng);
    const AFVAL: ResolvedType<typeof promiseAFVAL> = await dataCache.add(
      sessionID,
      'AFVAL',
      promiseAFVAL
    );
    AFVALresponse = AFVAL;
  }

  return {
    BRP,
    BAG: BAGresponse,
    AFVAL: AFVALresponse,
  };
}
