import memoizee from 'memoizee';

import { VergunningFrontendV2, VergunningV2 } from './config-and-types';
import { decosZaakTransformers } from './decos-zaken';
import { getStatusSteps } from './vergunningen-status-steps';
import { AppRoute, AppRoutes } from '../../../universal/config/routes';
import { apiSuccessResult } from '../../../universal/helpers/api';
import { AuthProfileAndToken } from '../../auth/auth-types';
import { DEFAULT_API_CACHE_TTL_MS } from '../../config/source-api';
import { encryptSessionIdWithRouteIdParam } from '../../helpers/encrypt-decrypt';
import { BffEndpoints } from '../../routing/bff-routes';
import { generateFullApiUrlBFF } from '../../routing/route-helpers';
import {
  fetchDecosZaak,
  fetchDecosZaken,
  transformDecosZaakFrontend,
} from '../decos/decos-service';
import { DecosZaakDocument } from '../decos/decos-types';
import { decryptEncryptedRouteParamAndValidateSessionID } from '../shared/decrypt-route-param';

function transformVergunningFrontend(
  sessionID: SessionID,
  vergunning: VergunningV2,
  appRoute: AppRoute
) {
  const vergunningFrontend = transformDecosZaakFrontend<VergunningV2>(
    sessionID,
    appRoute,
    vergunning
  );
  // Assign the definitive status steps
  vergunningFrontend.steps = getStatusSteps(vergunningFrontend);

  return vergunningFrontend;
}

async function fetchVergunningen_(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken,
  appRoute: AppRoute = AppRoutes['VERGUNNINGEN/DETAIL']
) {
  const response = await fetchDecosZaken(
    requestID,
    authProfileAndToken,
    decosZaakTransformers
  );

  if (response.status === 'OK') {
    const decosVergunningen = response.content;
    const vergunningenFrontend: VergunningFrontendV2[] = decosVergunningen.map(
      (vergunning) =>
        transformDecosZaakFrontend<VergunningV2>(
          authProfileAndToken.profile.sid,
          appRoute,
          vergunning
        )
    );
    return apiSuccessResult(vergunningenFrontend);
  }

  return response;
}

export const fetchVergunningen = memoizee(fetchVergunningen_, {
  maxAge: DEFAULT_API_CACHE_TTL_MS,
});

function addEncryptedDocumentDownloadUrl(
  sessionID: SessionID,
  document: DecosZaakDocument
) {
  const documentIdEncrypted = encryptSessionIdWithRouteIdParam(
    sessionID,
    document.key
  );

  return {
    ...document,
    // Adds an url to the BFF api for document download which accepts an encrypted ID only
    url: generateFullApiUrlBFF(BffEndpoints.DECOS_DOCUMENT_DOWNLOAD, [
      { id: documentIdEncrypted },
    ]),
  };
}

export async function fetchVergunningV2(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken,
  vergunningIdEncrypted: string
) {
  const decryptResult = decryptEncryptedRouteParamAndValidateSessionID(
    vergunningIdEncrypted,
    authProfileAndToken
  );

  if (decryptResult.status === 'OK') {
    const response = await fetchDecosZaak(
      requestID,
      decosZaakTransformers,
      decryptResult.content
    );
    if (response.status === 'OK' && response.content?.decosZaak) {
      const { decosZaak, documents } = response.content;
      const documentsTransformed = documents.map((document) =>
        addEncryptedDocumentDownloadUrl(
          authProfileAndToken.profile.sid,
          document
        )
      );

      return apiSuccessResult({
        vergunning: transformVergunningFrontend(
          authProfileAndToken.profile.id,
          decosZaak,
          AppRoutes['VERGUNNINGEN/DETAIL']
        ),
        documents: documentsTransformed,
      });
    }
    return response;
  }

  return decryptResult;
}
