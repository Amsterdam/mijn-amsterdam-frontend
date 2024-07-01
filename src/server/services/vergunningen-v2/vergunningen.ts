import { generatePath } from 'react-router-dom';
import slug from 'slugme';
import { AppRoute, AppRoutes } from '../../../universal/config';
import {
  apiErrorResult,
  apiSuccessResult,
  defaultDateFormat,
} from '../../../universal/helpers';
import { BffEndpoints, ONE_SECOND_MS } from '../../config';
import { AuthProfileAndToken, generateFullApiUrlBFF } from '../../helpers/app';
import {
  EXCLUDE_CASE_TYPES_FROM_VERGUNNINGEN_THEMA,
  VergunningCaseTypeFilter,
  VergunningDocument,
  VergunningFrontendV2,
  VergunningV2,
} from './config-and-types';
import {
  fetchDecosDocument,
  fetchDecosVergunning,
  fetchDecosVergunningen,
} from './decos-service';

import memoizee from 'memoizee';
import { decrypt, encrypt } from '../../../universal/helpers/encrypt-decrypt';
import { captureException } from '../monitoring';
import { isExpired, toDateFormatted } from './helpers';
import { getStatusSteps } from './vergunningen-status-steps';

function transformVergunningFrontend(
  userId: AuthProfileAndToken['profile']['id'],
  vergunning: VergunningV2,
  appRoute: AppRoute
) {
  const [idEncrypted] = encrypt(`${userId}:${vergunning.key}`);
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
  requestID: requestID,
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
          authProfileAndToken.profile.id,
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
  }
);

export async function fetchVergunningenV2(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
) {
  return fetchAndFilterVergunningenV2(
    requestID,
    authProfileAndToken,
    AppRoutes['VERGUNNINGEN/DETAIL'],
    (vergunning: VergunningV2) => {
      return !EXCLUDE_CASE_TYPES_FROM_VERGUNNINGEN_THEMA.includes(
        vergunning.caseType
      );
    }
  );
}

// TODO: Make generic for all endpoints
function decryptAndValidate(
  idEncrypted: string,
  authProfileAndToken: AuthProfileAndToken
) {
  let userID: AuthProfileAndToken['profile']['id'] | null = null;
  let id: string | null = null;

  try {
    [userID, id] = decrypt(idEncrypted).split(':');
  } catch (error) {
    captureException(error);
  }

  if (!userID || !id || authProfileAndToken.profile.id !== userID) {
    return apiErrorResult('Not authorized', null, 401);
  }

  return apiSuccessResult(id);
}

function addEncryptedDocumentIdToUrl(
  userID: AuthProfileAndToken['profile']['id'],
  document: VergunningDocument
) {
  const [documentIdEncrypted] = encrypt(`${userID}:${document.key}`);

  return {
    ...document,
    // Adds an url to the BFF api for document download which accepts an encrypted ID only
    url: generateFullApiUrlBFF(BffEndpoints.VERGUNNINGENv2_DOCUMENT_DOWNLOAD, {
      id: documentIdEncrypted,
    }),
  };
}

export async function fetchVergunningV2(
  requestID: requestID,
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
        addEncryptedDocumentIdToUrl(authProfileAndToken.profile.id, document)
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

export async function fetchVergunningDocumentV2(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken,
  vergunningDocumentIdEncrypted: string
) {
  const decryptResult = decryptAndValidate(
    vergunningDocumentIdEncrypted,
    authProfileAndToken
  );

  if (decryptResult.status === 'OK') {
    return fetchDecosDocument(requestID, decryptResult.content);
  }

  return decryptResult;
}
