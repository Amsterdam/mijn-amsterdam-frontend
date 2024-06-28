import { generatePath } from 'react-router-dom';
import slug from 'slugme';
import { AppRoutes } from '../../../universal/config';
import {
  apiErrorResult,
  apiSuccessResult,
  defaultDateFormat,
} from '../../../universal/helpers';
import { BffEndpoints } from '../../config';
import { AuthProfileAndToken, generateFullApiUrlBFF } from '../../helpers/app';
import {
  RVVSloterweg,
  VergunningDocument,
  VergunningFrontendV2,
  VergunningV2,
} from './config-and-types';
import {
  fetchDecosDocument,
  fetchDecosVergunning,
  fetchDecosVergunningen,
} from './decos-service';

import { decrypt, encrypt } from '../../../universal/helpers/encrypt-decrypt';
import { StatusLineItem } from '../../../universal/types';
import { captureException } from '../monitoring';
import { isExpired, toDateFormatted } from './helpers';
import { CaseTypeV2 } from '../../../universal/types/vergunningen';

export function getStatusStepsRVVSloterweg(
  vergunning: RVVSloterweg
): StatusLineItem[] {
  const RVV_SLOTERWEG_RESULT_NOT_APPLICABLE = 'Ingetrokken';
  const RVV_SLOTERWEG_RESULT_EXPIRED = 'Verlopen';
  const RVV_SLOTERWEG_RESULT_UPDATED_WITH_NEW_KENTEKEN = 'Vervallen';

  // Update of the kentekens on an active permit.
  const isChangeRequest = vergunning.requestType !== 'Nieuw';

  const isReceived =
    (!vergunning.dateInBehandeling || !vergunning.dateWorkflowVerleend) &&
    !vergunning.decision;

  const isInprogress = !!vergunning.dateInBehandeling || !isChangeRequest;
  const isGranted = !!vergunning.dateWorkflowVerleend;
  const isExpiredByEndDate =
    vergunning.dateEnd &&
    isGranted &&
    new Date(vergunning.dateEnd) <= new Date();
  const isExpired =
    isExpiredByEndDate || vergunning.decision === RVV_SLOTERWEG_RESULT_EXPIRED;

  const dateInProgress =
    (isChangeRequest ? vergunning.dateInBehandeling : vergunning.dateRequest) ??
    '';

  const hasDecision = [
    RVV_SLOTERWEG_RESULT_NOT_APPLICABLE,
    RVV_SLOTERWEG_RESULT_EXPIRED,
    RVV_SLOTERWEG_RESULT_UPDATED_WITH_NEW_KENTEKEN,
  ].includes(vergunning.decision);

  const isIngetrokken =
    vergunning.decision === RVV_SLOTERWEG_RESULT_NOT_APPLICABLE;

  const hasUpdatedKenteken =
    vergunning.decision === RVV_SLOTERWEG_RESULT_UPDATED_WITH_NEW_KENTEKEN;

  const descriptionIngetrokken = `Wij hebben uw RVV ontheffing ${vergunning.area} voor kenteken ${vergunning.kentekens} ingetrokken. Zie het intrekkingsbesluit voor meer informatie.`;

  let descriptionAfgehandeld = '';

  switch (true) {
    case isGranted && isChangeRequest:
      descriptionAfgehandeld = `Wij hebben uw kentekenwijziging voor een ${vergunning.title} verleend.`;
      break;
    case isGranted && !isChangeRequest:
      descriptionAfgehandeld = `Wij hebben uw aanvraag voor een RVV ontheffing ${vergunning.area} ${vergunning.kentekens} verleend.`;
      break;
    case !isGranted && isIngetrokken:
      descriptionAfgehandeld = descriptionIngetrokken;
      break;
  }

  const steps: StatusLineItem[] = [
    {
      id: 'step-1',
      status: 'Ontvangen',
      datePublished: vergunning.dateRequest,
      description: '',
      documents: [],
      isActive: isReceived && !isGranted && !isInprogress,
      isChecked: true,
    },
    {
      id: 'step-2',
      status: 'In behandeling',
      datePublished: dateInProgress,
      description: '',
      documents: [],
      isActive: isInprogress && !isGranted && !hasDecision,
      isChecked: isInprogress || isGranted || hasDecision,
    },
    {
      id: 'step-3',
      status: 'Afgehandeld',
      datePublished:
        !vergunning.dateWorkflowVerleend && !!vergunning.dateDecision
          ? vergunning.dateDecision
          : !!vergunning.dateWorkflowVerleend
            ? vergunning.dateWorkflowVerleend
            : '',
      description: descriptionAfgehandeld,
      documents: [],
      isActive: (isGranted && !hasDecision) || (!isGranted && hasDecision),
      isChecked: isGranted || hasDecision,
    },
  ];

  if (isGranted && (isIngetrokken || isExpired || hasUpdatedKenteken)) {
    let description = '';

    switch (true) {
      case isIngetrokken:
        description = descriptionIngetrokken;
        break;
      case isExpired:
        description = `Uw RVV ontheffing ${vergunning.area} voor kenteken ${vergunning.kentekens} is verlopen.`;
        break;
      case hasUpdatedKenteken:
        description =
          'U heeft een nieuw kenteken doorgegeven. Bekijk de ontheffing voor het nieuwe kenteken in het overzicht.';
        break;
    }

    steps.push({
      id: 'step-4',
      status: 'Gewijzigd',
      datePublished:
        (isExpiredByEndDate ? vergunning.dateEnd : vergunning.dateDecision) ??
        '',
      description,
      documents: [],
      isActive: true,
      isChecked: true,
    });
  }

  return steps;
}

function getStatusSteps(vergunning: VergunningFrontendV2) {
  if (vergunning.caseType === CaseTypeV2.RVVSloterweg) {
    return getStatusStepsRVVSloterweg(vergunning);
  }

  const isAfgehandeld = vergunning.processed;
  const hasDateInBehandeling = !!vergunning.dateInBehandeling;
  const isInBehandeling = hasDateInBehandeling && !isAfgehandeld;
  const isExpiredByEndDate =
    !!vergunning.dateEnd &&
    vergunning.decision === 'Verleend' &&
    new Date(vergunning.dateEnd) <= new Date();
  const isExpired = isExpiredByEndDate;

  const steps: StatusLineItem[] = [
    {
      id: 'step-1',
      status: 'Ontvangen',
      datePublished: vergunning.dateRequest,
      description: '',
      documents: [],
      isActive: !isInBehandeling && !isAfgehandeld,
      isChecked: true,
    },
    {
      id: 'step-2',
      status: 'In behandeling',
      datePublished: vergunning.dateInBehandeling || '',
      description: '',
      documents: [],
      isActive: isInBehandeling,
      isChecked: hasDateInBehandeling || isAfgehandeld,
    },
    {
      id: 'step-3',
      status: 'Afgehandeld',
      datePublished: vergunning.dateDecision || '',
      description: isAfgehandeld
        ? `Wij hebben uw aanvraag ${vergunning.title} <strong>${vergunning.decision}</strong>`
        : '',
      documents: [],
      isActive: !isExpired && isAfgehandeld,
      isChecked: isAfgehandeld,
    },
  ];

  if ('isExpired' in vergunning) {
    if (isExpired) {
      steps.push({
        id: 'step-4',
        status: 'Gewijzigd',
        datePublished: vergunning.dateEnd ?? '',
        description: `Uw ${vergunning.title} is verlopen.`,
        documents: [],
        isActive: true,
        isChecked: true,
      });
    }
  }

  return steps;
}

function transformVergunningFrontend(
  userId: AuthProfileAndToken['profile']['id'],
  vergunning: VergunningV2
) {
  const [idEncrypted] = encrypt(`${userId}:${vergunning.key}`);
  const vergunningFrontend: VergunningFrontendV2 = {
    ...vergunning,
    dateDecisionFormatted: toDateFormatted(vergunning.dateDecision),
    dateInBehandelingFormatted: toDateFormatted(vergunning.dateInBehandeling),
    dateRequestFormatted: defaultDateFormat(vergunning.dateRequest),
    // Assign Status steps
    steps: [],
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
    vergunningFrontend.dateEndFormatted = defaultDateFormat(vergunning.dateEnd);
  }

  vergunningFrontend.steps = getStatusSteps(vergunningFrontend);

  return vergunningFrontend;
}

export async function fetchVergunningenV2(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const response = await fetchDecosVergunningen(requestID, authProfileAndToken);

  if (response.status === 'OK') {
    const vergunningenFrontend: VergunningFrontendV2[] = response.content.map(
      (vergunning) =>
        transformVergunningFrontend(authProfileAndToken.profile.id, vergunning)
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

function addEncryptedDocumentIdToUrl(
  userID: AuthProfileAndToken['profile']['id'],
  document: VergunningDocument
) {
  const [documentIdEncrypted] = encrypt(`${userID}:${document.key}`);

  return {
    ...document,
    // Adds an url to the BFF api for document download which accepts an encrypted ID only
    url: generateFullApiUrlBFF(BffEndpoints.VERGUNNINGEN_DOCUMENT_DOWNLOAD, {
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
      const { vergunning, documents = [] } = response.content;
      const documentsTransformed = documents.map((document) =>
        addEncryptedDocumentIdToUrl(authProfileAndToken.profile.id, document)
      );

      return apiSuccessResult({
        vergunning: transformVergunningFrontend(
          authProfileAndToken.profile.id,
          vergunning
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
