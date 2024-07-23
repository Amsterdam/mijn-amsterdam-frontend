import parseISO from 'date-fns/parseISO';
import { generatePath } from 'react-router-dom';
import { FeatureToggle } from '../../../universal/config/feature-toggles';
import { AppRoutes } from '../../../universal/config/routes';
import { apiSuccessResult } from '../../../universal/helpers/api';
import { dateSort } from '../../../universal/helpers/date';
import { capitalizeFirstLetter } from '../../../universal/helpers/text';
import { GenericDocument, StatusLineItem } from '../../../universal/types';
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

function getDocuments(
  sessionID: AuthProfileAndToken['profile']['sid'],
  aanvraagTransformed: ZorgnedAanvraagTransformed
) {
  let documents: GenericDocument[] = [];

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

  if (
    FeatureToggle.zorgnedDocumentAttachmentsActive &&
    aanvraagTransformed.documenten.length === 1 &&
    parseISO(aanvraagTransformed.datumAanvraag) >=
      MINIMUM_REQUEST_DATE_FOR_DOCUMENTS
  ) {
    documents = getAanvraagDocumentenFrontend();
  }

  return documents;
}

function addAltDocumentContentToLineItems(
  aanvraagTransformed: ZorgnedAanvraagTransformed,
  statusLineItems: StatusLineItem[]
) {
  return statusLineItems.map((lineItem) => {
    if (lineItem.status === 'Besluit') {
      if (
        FeatureToggle.zorgnedDocumentAttachmentsActive &&
        aanvraagTransformed.documenten.length === 1 &&
        parseISO(aanvraagTransformed.datumAanvraag) >=
          MINIMUM_REQUEST_DATE_FOR_DOCUMENTS
      ) {
        lineItem.altDocumentContent = `<p><strong>Dit document staat bij documenten bovenaan deze pagina</strong></p>`;
      } else {
        lineItem.altDocumentContent = `<p><strong>Verstuurd per post</strong></p>`;
      }
    }
    return lineItem;
  });
}

function getLatestStatus(steps: StatusLineItem[]) {
  return steps.find((step) => step.isActive)?.status ?? 'Onbekend';
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
      ? addAltDocumentContentToLineItems(aanvraag, lineItems)
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
        documents: getDocuments(sessionID, aanvraag),
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
  getDocuments,
  addAltDocumentContentToLineItems,
};
