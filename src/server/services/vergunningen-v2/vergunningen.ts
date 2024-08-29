import { generatePath } from 'react-router-dom';
import slug from 'slugme';
import { BffEndpoints, ONE_SECOND_MS } from '../../config';
import { AuthProfileAndToken, generateFullApiUrlBFF } from '../../helpers/app';
import {
  EXCLUDE_CASE_TYPES_FROM_VERGUNNINGEN_THEMA,
  VergunningCaseTypeFilter,
  VergunningDocument,
  VergunningFilter,
  VergunningFrontendV2,
  VergunningV2,
} from './config-and-types';
import { fetchDecosVergunning, fetchDecosVergunningen } from './decos-service';

import memoizee from 'memoizee';
import { AppRoute, AppRoutes } from '../../../universal/config/routes';
import { apiSuccessResult } from '../../../universal/helpers/api';
import { defaultDateFormat } from '../../../universal/helpers/date';
import { encrypt } from '../../helpers/encrypt-decrypt';
import { decryptAndValidate } from '../shared/decrypt-route-param';
import { isExpired, toDateFormatted } from './helpers';
import { getStatusSteps } from './vergunningen-status-steps';

export const FILTER_VERGUNNINGEN_DEFAULT: VergunningFilter = (
  vergunning: VergunningV2
) => {
  return !EXCLUDE_CASE_TYPES_FROM_VERGUNNINGEN_THEMA.includes(
    vergunning.caseType
  );
};

function transformVergunningFrontend(
  sessionID: AuthProfileAndToken['profile']['sid'],
  vergunning: VergunningV2,
  appRoute: AppRoute
) {
  const [idEncrypted] = encrypt(`${sessionID}:${vergunning.key}`);
  const vergunningFrontend: VergunningFrontendV2 = {
    ...vergunning,
    dateDecisionFormatted: toDateFormatted(vergunning.dateDecision),
    dateInBehandelingFormatted: toDateFormatted(vergunning.dateInBehandeling),
    dateRequestFormatted: defaultDateFormat(vergunning.dateRequest),
    // Assign Status steps later on
    steps: [],
    // Adds an url with encrypted id to the BFF Detail page api for vergunningen.
    fetchUrl: generateFullApiUrlBFF(BffEndpoints.VERGUNNINGENv2_DETAIL, {
      id: idEncrypted,
    }),
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
    vergunningFrontend.isExpired = isExpired(vergunning);
    vergunningFrontend.dateStartFormatted = defaultDateFormat(
      vergunning.dateStart
    );
    vergunningFrontend.dateEndFormatted = defaultDateFormat(vergunning.dateEnd);
  }

  // Assign the definitive status steps
  vergunningFrontend.steps = getStatusSteps(vergunningFrontend);

  return vergunningFrontend;
}

async function fetchAndFilterVergunningenV2_(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken,
  appRoute: AppRoute,
  caseTypeFilter?: VergunningCaseTypeFilter
) {
  const response = await fetchDecosVergunningen(requestID, authProfileAndToken);

  if (response.status === 'OK') {
    let decosVergunningen = response.content;
    if (caseTypeFilter) {
      decosVergunningen = decosVergunningen.filter(caseTypeFilter);
    }
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

export const fetchAndFilterVergunningenV2 = memoizee(
  fetchAndFilterVergunningenV2_,
  {
    maxAge: 45 * ONE_SECOND_MS,
    length: 4,
  }
);

export async function fetchVergunningenV2(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken,
  appRoute: AppRoute = AppRoutes['VERGUNNINGEN/DETAIL'],
  filter: VergunningFilter = FILTER_VERGUNNINGEN_DEFAULT
) {
  return fetchAndFilterVergunningenV2(
    requestID,
    authProfileAndToken,
    appRoute,
    filter
  );
}

function addEncryptedDocumentIdToUrl(
  sessionID: AuthProfileAndToken['profile']['sid'],
  document: VergunningDocument
) {
  const [documentIdEncrypted] = encrypt(`${sessionID}:${document.key}`);

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
  const decryptResult = decryptAndValidate(
    vergunningIdEncrypted,
    authProfileAndToken
  );

  if (decryptResult.status === 'OK') {
    const response = await fetchDecosVergunning(
      requestID,
      decryptResult.content
    );
    if (response.status === 'OK' && response.content?.vergunning) {
      const { vergunning, documents } = response.content;
      const documentsTransformed = documents.map((document) =>
        addEncryptedDocumentIdToUrl(authProfileAndToken.profile.sid, document)
      );

      return apiSuccessResult({
        vergunning: transformVergunningFrontend(
          authProfileAndToken.profile.id,
          vergunning,
          AppRoutes['VERGUNNINGEN/DETAIL']
        ),
        documents: documentsTransformed,
      });
    }
    return response;
  }

  return decryptResult;
}
