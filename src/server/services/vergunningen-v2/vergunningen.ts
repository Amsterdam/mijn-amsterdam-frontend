import { generatePath } from 'react-router-dom';
import slug from 'slugme';
import { AppRoutes } from '../../../universal/config';
import { apiErrorResult, apiSuccessResult } from '../../../universal/helpers';
import { BFF_BASE_PATH, BffEndpoints } from '../../config';
import { AuthProfileAndToken } from '../../helpers/app';
import { VergunningV2 } from './config-and-types';
import {
  fetchDecosDocument,
  fetchDecosVergunning,
  fetchDecosVergunningen,
} from './decos-service';

import { decrypt, encrypt } from '../../../universal/helpers/encrypt-decrypt';
import { captureException } from '../monitoring';

function getStatusLineItems(vergunning: VergunningV2) {
  return [];
}

export async function fetchVergunningenV2(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const response = await fetchDecosVergunningen(requestID, authProfileAndToken);
  if (response.status === 'OK') {
    const vergunningenFrontend = response.content.map((vergunning) => {
      const [idEncrypted] = encrypt(
        `${authProfileAndToken.profile.id}:${vergunning.key}`
      );
      return {
        ...vergunning,
        steps: getStatusLineItems(vergunning),
        // TODO: Use generateFullApiUrlBFF when https://github.com/Amsterdam/mijn-amsterdam-frontend/pull/1314 makes it into main.
        fetchUrl: `${process.env.BFF_OIDC_BASE_URL}${generatePath(
          `${BFF_BASE_PATH}${BffEndpoints.VERGUNNINGENv2_DETAIL}`,
          {
            id: idEncrypted,
          }
        )}`,
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
    });
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
