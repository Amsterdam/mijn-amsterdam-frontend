import { fetchAFVAL, fetchBRP } from './index';
import {
  ApiDependencyErrorResponse,
  apiDependencyError,
} from '../../universal/helpers';
import { fetchHOME } from './home';
import { scrapeGarbageCenterData } from './afval/afvalpunten';

type AFVALResponseData =
  | ResolvedType<ReturnType<typeof fetchAFVAL>>
  | ApiDependencyErrorResponse;

type AFVALPUNTENResponseData =
  | ResolvedType<ReturnType<typeof scrapeGarbageCenterData>>
  | ApiDependencyErrorResponse;

export async function loadServicesAfval(
  sessionID: SessionID,
  samlToken: string,
  raw: boolean = false
) {
  const BRP = await fetchBRP(sessionID, samlToken, raw);
  const HOME = await fetchHOME(sessionID, samlToken);

  let AFVAL: AFVALResponseData;
  let AFVALPUNTEN: AFVALPUNTENResponseData;

  if (HOME.status === 'OK') {
    AFVAL = await fetchAFVAL(sessionID, samlToken, HOME.content.latlng, raw);
    AFVALPUNTEN = await scrapeGarbageCenterData(HOME.content.latlng);
  } else {
    AFVAL = apiDependencyError({ BRP, HOME });
    AFVALPUNTEN = apiDependencyError({ BRP, HOME });
  }

  return {
    AFVAL,
    AFVALPUNTEN,
  };
}
