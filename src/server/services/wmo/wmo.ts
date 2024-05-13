import { parseISO } from 'date-fns';
import { generatePath } from 'react-router-dom';
import { AppRoutes } from '../../../universal/config';
import {
  apiSuccessResult,
  capitalizeFirstLetter,
  dateSort,
} from '../../../universal/helpers';
import { encrypt } from '../../../universal/helpers/encrypt-decrypt';
import { StatusLineItem } from '../../../universal/types';
import { AuthProfileAndToken } from '../../helpers/app';
import { getStatusLineItems } from './status-line-items/wmo-status-line-items';
import {
  MINIMUM_REQUEST_DATE_FOR_DOCUMENTS,
  WMOVoorziening,
  WMOVoorzieningFrontend,
} from './wmo-config-and-types';
import { fetchVoorzieningen } from './wmo-zorgned-service';

function encryptDocumentIds(
  sessionID: AuthProfileAndToken['profile']['sid'],
  statusLineItems: StatusLineItem[]
) {
  return statusLineItems.map((lineItem) => {
    if (lineItem.documents) {
      return {
        ...lineItem,
        documents: lineItem.documents.map((document) => {
          const [idEncrypted] = encrypt(`${sessionID}:${document.id}`);
          return {
            ...document,
            url: `/wmoned/document/${idEncrypted}`, // NOTE: Works with legacy relayApiUrl added in front-end. TODO: Remove relayApiUrl() concept.
            id: idEncrypted,
          };
        }),
      };
    }
    return lineItem;
  });
}

export function transformVoorzieningenForFrontend(
  sessionID: AuthProfileAndToken['profile']['sid'],
  voorzieningen: WMOVoorziening[],
  today: Date
): WMOVoorzieningFrontend[] {
  const voorzieningenFrontend: WMOVoorzieningFrontend[] = [];
  const voorzieningenVisible = voorzieningen.filter((voorziening) => {
    return parseISO(voorziening.datumAanvraag) >
      MINIMUM_REQUEST_DATE_FOR_DOCUMENTS
      ? !!voorziening.documenten?.length
      : parseISO(voorziening.datumAanvraag) <
          MINIMUM_REQUEST_DATE_FOR_DOCUMENTS;
  });

  for (const voorziening of voorzieningenVisible) {
    const id = voorziening.id;
    const lineItems = getStatusLineItems(voorziening, today);

    if (!Array.isArray(lineItems) || !lineItems.length) {
      continue;
    }

    const statusLineItems = Array.isArray(lineItems)
      ? encryptDocumentIds(sessionID, lineItems)
      : [];
    const route = generatePath(AppRoutes['ZORG/VOORZIENINGEN'], {
      id,
    });

    if (statusLineItems) {
      const voorzieningFrontend: WMOVoorzieningFrontend = {
        id,
        title: capitalizeFirstLetter(voorziening.titel),
        supplier: voorziening.leverancier,
        isActual: voorziening.isActueel,
        link: {
          title: 'Meer informatie',
          to: route,
        },
        steps: statusLineItems,
        // NOTE: Keep! This field is added specifically for the Tips api.
        itemTypeCode: voorziening.productsoortCode,
        dateDescision: voorziening.datumBesluit,
        dateStart: voorziening.datumIngangGeldigheid,
        dateEnd: voorziening.datumEindeGeldigheid,
      };

      voorzieningenFrontend.push(voorzieningFrontend);
    }
  }

  voorzieningenFrontend.sort(dateSort('dateStart', 'desc'));

  return voorzieningenFrontend;
}

export async function fetchWmo(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const voorzieningenResponse = await fetchVoorzieningen(
    requestID,
    authProfileAndToken
  );

  if (voorzieningenResponse.status === 'OK') {
    const voorzieningenFrontend = transformVoorzieningenForFrontend(
      authProfileAndToken.profile.sid,
      voorzieningenResponse.content,
      new Date()
    );
    return apiSuccessResult(voorzieningenFrontend);
  }

  return voorzieningenResponse;
}
