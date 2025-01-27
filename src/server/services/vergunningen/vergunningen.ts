import memoizee from 'memoizee';
import { generatePath } from 'react-router-dom';
import slug from 'slugme';

import { VergunningFrontendV2 } from './config-and-types';
import { decosZaakTransformers } from './decos-zaken';
import { isExpired } from './helpers';
import { getStatusSteps } from './vergunningen-status-steps';
import { AppRoute, AppRoutes } from '../../../universal/config/routes';
import { apiSuccessResult } from '../../../universal/helpers/api';
import { defaultDateFormat } from '../../../universal/helpers/date';
import { AuthProfileAndToken } from '../../auth/auth-types';
import { DEFAULT_API_CACHE_TTL_MS } from '../../config/source-api';
import { encryptSessionIdWithRouteIdParam } from '../../helpers/encrypt-decrypt';
import { BffEndpoints } from '../../routing/bff-routes';
import { generateFullApiUrlBFF } from '../../routing/route-helpers';
import { fetchDecosZaak, fetchDecosZaken } from '../decos/decos-service';
import { DecosZaakBase, DecosZaakDocument } from '../decos/decos-types';
import { getStatusDate, toDateFormatted } from '../decos/helpers';
import { decryptEncryptedRouteParamAndValidateSessionID } from '../shared/decrypt-route-param';

export function transformVergunningFrontend<V extends DecosZaakBase>(
  sessionID: SessionID,
  vergunning: V,
  appRoute: AppRoute
) {
  const idEncrypted = encryptSessionIdWithRouteIdParam(
    sessionID,
    vergunning.key
  );
  const vergunningFrontend: VergunningFrontendV2<V> = {
    ...vergunning,
    dateDecisionFormatted: toDateFormatted(vergunning.dateDecision),
    dateInBehandeling: getStatusDate('In behandeling', vergunning),
    dateInBehandelingFormatted: toDateFormatted(
      getStatusDate('In behandeling', vergunning)
    ),
    dateRequestFormatted: defaultDateFormat(vergunning.dateRequest),
    // Assign Status steps later on
    steps: [],
    // Adds an url with encrypted id to the BFF Detail page api for vergunningen.
    fetchDocumentsUrl: `${generateFullApiUrlBFF(
      BffEndpoints.VERGUNNINGENv2_DOCUMENTS_LIST
    )}?id=${idEncrypted}`,
    link: {
      to: generatePath(appRoute, {
        title: slug(vergunning.caseType, {
          lower: true,
        }),
        id: vergunning.id,
      }),
      title: `Bekijk hoe het met uw aanvraag staat`,
    },
  };

  // If a vergunning has both dateStart and dateEnd add formatted dates and an expiration indication.
  if (
    'dateEnd' in vergunning &&
    'dateStart' in vergunning &&
    vergunning.dateStart &&
    vergunning.dateEnd
  ) {
    vergunningFrontend.isExpired = isExpired(vergunningFrontend);
    vergunningFrontend.dateStartFormatted = defaultDateFormat(
      vergunning.dateStart
    );
    vergunningFrontend.dateEndFormatted = defaultDateFormat(vergunning.dateEnd);
  }

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
        transformVergunningFrontend(
          authProfileAndToken.profile.sid,
          vergunning,
          appRoute
        )
    );
    return apiSuccessResult(vergunningenFrontend);
  }

  return response;
}

export const fetchVergunningen = memoizee(fetchVergunningen_, {
  maxAge: DEFAULT_API_CACHE_TTL_MS,
});

function setEncryptedDocumentDownloadUrl(
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
    url: generateFullApiUrlBFF(BffEndpoints.VERGUNNINGENv2_DOCUMENT_DOWNLOAD, {
      id: documentIdEncrypted,
    }),
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
        setEncryptedDocumentDownloadUrl(
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
