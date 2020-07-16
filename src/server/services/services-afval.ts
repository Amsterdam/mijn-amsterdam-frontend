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
  passthroughRequestHeaders: Record<string, string>
) {
  const BRP = await fetchBRP(sessionID, passthroughRequestHeaders);
  const HOME = await fetchHOME(sessionID, passthroughRequestHeaders);

  let AFVAL: AFVALResponseData;
  let AFVALPUNTEN: AFVALPUNTENResponseData;

  if (HOME.status === 'OK') {
    AFVAL = await fetchAFVAL(
      sessionID,
      passthroughRequestHeaders,
      HOME.content?.latlng
    );
    AFVALPUNTEN = await scrapeGarbageCenterData(HOME.content?.latlng);
  } else {
    AFVAL = apiDependencyError({ BRP, HOME });
    AFVALPUNTEN = apiDependencyError({ BRP, HOME });
  }

  return {
    AFVAL,
    AFVALPUNTEN,
  };
}
