import { generatePath } from 'react-router-dom';
import { AppRoutes, FeatureToggle } from '../../../universal/config';
import {
  apiSuccessResult,
  capitalizeFirstLetter,
  dateSort,
} from '../../../universal/helpers';
import { encrypt } from '../../../universal/helpers/encrypt-decrypt';
import { StatusLineItem } from '../../../universal/types';
import { AuthProfileAndToken, generateFullApiUrlBFF } from '../../helpers/app';
import { ZorgnedAanvraagTransformed } from '../zorgned/zorgned-config-and-types';
import { getStatusLineItems } from '../zorgned/zorgned-status-line-items';
import {
  MINIMUM_REQUEST_DATE_FOR_DOCUMENTS,
  SINGLE_DOC_TITLE_BESLUIT,
  WMOVoorzieningFrontend,
} from './wmo-config-and-types';
import { wmoStatusLineItemsConfig } from './wmo-status-line-items';
import { fetchZorgnedAanvragenWMO } from './wmo-zorgned-service';
import parseISO from 'date-fns/parseISO';

function assignLineItemDocuments(
  sessionID: AuthProfileAndToken['profile']['sid'],
  aanvraagTransformed: ZorgnedAanvraagTransformed,
  statusLineItems: StatusLineItem[]
) {
  function getAanvraagDocumentenFrontend() {
    return aanvraagTransformed.documenten.map((document) => {
      const [idEncrypted] = encrypt(`${sessionID}:${document.id}`);
      return {
        ...document,
        title: SINGLE_DOC_TITLE_BESLUIT, // TODO: Change if we get proper document names from Zorgned api
        url: generateFullApiUrlBFF(BffEndpoints.WMO_DOCUMENT_DOWNLOAD, {
              id: idEncrypted,
            }),
        };
    });
  }

  return statusLineItems.map((lineItem) => {
    // NOTE: We only show a single document for now. If document management and processing policy is implemented in Zorgned/WMO we'll show more documents.
    if (lineItem.status === 'Besluit') {
      if (
        FeatureToggle.zorgnedDocumentAttachmentsActive &&
        aanvraagTransformed.documenten.length === 1 &&
        parseISO(aanvraagTransformed.datumAanvraag) >=
          MINIMUM_REQUEST_DATE_FOR_DOCUMENTS
      ) {
        lineItem.documents = getAanvraagDocumentenFrontend();
      } else {
        lineItem.altDocumentContent = `<p>
              <strong>
                Verstuurd per post
              </strong>
            </p>`;
      }
    }

    return lineItem;
  });
}

export function transformVoorzieningenForFrontend(
  sessionID: AuthProfileAndToken['profile']['sid'],
  aanvragen: ZorgnedAanvraagTransformed[],
  today: Date
): WMOVoorzieningFrontend[] {
  const voorzieningenFrontend: WMOVoorzieningFrontend[] = [];

  for (const aanvraag of aanvragen) {
    const id = aanvraag.id;

    const lineItems = getStatusLineItems(
      'WMO',
      wmoStatusLineItemsConfig,
      aanvraag,
      today
    );

    if (!Array.isArray(lineItems) || !lineItems.length) {
      continue;
    }

    const statusLineItems = Array.isArray(lineItems)
      ? assignLineItemDocuments(sessionID, aanvraag, lineItems)
      : [];

    const route = generatePath(AppRoutes['ZORG/VOORZIENINGEN'], {
      id,
    });

    if (statusLineItems) {
      const voorzieningFrontend: WMOVoorzieningFrontend = {
        id,
        title: capitalizeFirstLetter(aanvraag.titel),
        supplier: aanvraag.leverancier,
        isActual: aanvraag.isActueel,
        link: {
          title: 'Meer informatie',
          to: route,
        },
        steps: statusLineItems,
        // NOTE: Keep! This field is added specifically for the Tips api.
        itemTypeCode: aanvraag.productsoortCode,
        dateDescision: aanvraag.datumBesluit,
        dateStart: aanvraag.datumIngangGeldigheid,
        dateEnd: aanvraag.datumEindeGeldigheid,
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
  const voorzieningenResponse = await fetchZorgnedAanvragenWMO(
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
