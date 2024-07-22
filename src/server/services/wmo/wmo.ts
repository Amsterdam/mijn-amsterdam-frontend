import parseISO from 'date-fns/parseISO';
import { generatePath } from 'react-router-dom';
import { FeatureToggle } from '../../../universal/config/feature-toggles';
import { AppRoutes } from '../../../universal/config/routes';
import { apiSuccessResult } from '../../../universal/helpers/api';
import { dateSort } from '../../../universal/helpers/date';
import { capitalizeFirstLetter } from '../../../universal/helpers/text';
import { StatusLineItem } from '../../../universal/types';
import { BffEndpoints } from '../../config';
import { AuthProfileAndToken, generateFullApiUrlBFF } from '../../helpers/app';
import { encrypt } from '../../helpers/encrypt-decrypt';
import { ZorgnedAanvraagTransformed } from '../zorgned/zorgned-config-and-types';
import { getStatusLineItems } from '../zorgned/zorgned-status-line-items';
import {
  MINIMUM_REQUEST_DATE_FOR_DOCUMENTS,
  SINGLE_DOC_TITLE_BESLUIT,
  WMOVoorzieningFrontend,
} from './wmo-config-and-types';
import { wmoStatusLineItemsConfig } from './wmo-status-line-items';
import { fetchZorgnedAanvragenWMO } from './wmo-zorgned-service';
import { isAfter } from 'date-fns';

function addDocumentLinksToLineItems(
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

function getLatestStatus(steps: StatusLineItem[]): string {
  if (steps.length === 0) return 'Onbekend';

  const mostRecentStep = steps.reduce((acc, step) =>
    isAfter(new Date(step.datePublished), new Date(acc.datePublished))
      ? step
      : acc
  );

  return mostRecentStep.status;
}

function transformVoorzieningenForFrontend(
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
      ? addDocumentLinksToLineItems(sessionID, aanvraag, lineItems)
      : [];

    const route = generatePath(AppRoutes['ZORG/VOORZIENINGEN'], {
      id,
    });

    if (statusLineItems) {
      const voorzieningFrontend: {
        isActual: boolean;
        dateStart: string;
        supplier: string;
        itemTypeCode: string;
        link: { to: string; title: string };
        dateDescision: string;
        resultaat: string;
        id: string;
        dateEnd: string;
        title: string;
        steps: StatusLineItem[];
        status: string;
      } = {
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
        resultaat: aanvraag.resultaat,
        dateDescision: aanvraag.datumBesluit,
        dateStart: aanvraag.datumIngangGeldigheid,
        dateEnd: aanvraag.datumEindeGeldigheid,
        status: getLatestStatus(statusLineItems),
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

export const forTesting = {
  transformVoorzieningenForFrontend,
  addDocumentLinksToLineItems,
};
