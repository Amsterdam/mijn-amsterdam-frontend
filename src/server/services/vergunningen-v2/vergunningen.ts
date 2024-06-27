import { generatePath } from 'react-router-dom';
import slug from 'slugme';
import { AppRoutes } from '../../../universal/config';
import {
  apiErrorResult,
  apiSuccessResult,
  defaultDateFormat,
} from '../../../universal/helpers';
import { BFF_BASE_PATH, BffEndpoints } from '../../config';
import { AuthProfileAndToken, generateFullApiUrlBFF } from '../../helpers/app';
import { VergunningV2, VergunningFrontendV2 } from './config-and-types';
import {
  fetchDecosDocument,
  fetchDecosVergunning,
  fetchDecosVergunningen,
} from './decos-service';

import { decrypt, encrypt } from '../../../universal/helpers/encrypt-decrypt';
import { captureException } from '../monitoring';
import { isExpired } from './helpers';

function getStatusLineItems(vergunning: VergunningV2) {
  return [];
}

export async function fetchVergunningenV2(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const response = await fetchDecosVergunningen(requestID, authProfileAndToken);

  if (response.status === 'OK') {
    const vergunningenFrontend: VergunningFrontendV2[] = response.content.map(
      (vergunning) => {
        const [idEncrypted] = encrypt(
          `${authProfileAndToken.profile.id}:${vergunning.key}`
        );
        const vergunningFrontend: VergunningFrontendV2 = {
          ...vergunning,
          dateDecisionFormatted: vergunning.dateDecision
            ? defaultDateFormat(vergunning.dateDecision)
            : null,
          dateInBehandelingFormatted: vergunning.dateInBehandeling
            ? defaultDateFormat(vergunning.dateInBehandeling)
            : null,
          dateRequestFormatted: defaultDateFormat(vergunning.dateRequest),
          steps: getStatusLineItems(vergunning),
          // Adds an url with encrypted id to the BFF Detail page api for vergunningen.
          fetchUrl: generateFullApiUrlBFF(BffEndpoints.VERGUNNINGENv2_DETAIL, {
            id: idEncrypted,
          }),
          link: {
            to: generatePath(AppRoutes['VERGUNNINGEN/DETAIL'], {
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
          vergunningFrontend.dateEndFormatted = defaultDateFormat(
            vergunning.dateEnd
          );
        }

        return vergunningFrontend;
      }
    );
    return apiSuccessResult(vergunningenFrontend);
  }

  return response;
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
    if (response.status === 'OK') {
      const { vergunning, documents } = response.content;
      const documentsTransformed = documents.map((document) => {
        const [documentIdEncrypted] = encrypt(
          `${authProfileAndToken.profile.id}:${document.key}`
        );
        return {
          ...document,
          // Adds an url to the BFF api for document download which accepts an encrypted ID only
          url: `${process.env.BFF_OIDC_BASE_URL}${generatePath(
            `${BFF_BASE_PATH}${BffEndpoints.VERGUNNINGEN_DOCUMENT_DOWNLOAD}`,
            {
              id: documentIdEncrypted,
            }
          )}`,
        };
      });
      return apiSuccessResult({
        vergunning,
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
