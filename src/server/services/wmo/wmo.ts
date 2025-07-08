import { generatePath } from 'react-router';

import { getHulpmiddelenDisclaimer } from './status-line-items/wmo-hulpmiddelen.ts';
import { routeConfig } from '../../../client/pages/Thema/Zorg/Zorg-thema-config.ts';
import { FeatureToggle } from '../../../universal/config/feature-toggles.ts';
import { apiSuccessResult } from '../../../universal/helpers/api.ts';
import { dateSort, defaultDateFormat } from '../../../universal/helpers/date.ts';
import { capitalizeFirstLetter } from '../../../universal/helpers/text.ts';
import { AuthProfileAndToken } from '../../auth/auth-types.ts';
import { encryptSessionIdWithRouteIdParam } from '../../helpers/encrypt-decrypt.ts';
import { BffEndpoints } from '../../routing/bff-routes.ts';
import { generateFullApiUrlBFF } from '../../routing/route-helpers.ts';
import { getStatusLineItems } from '../zorgned/zorgned-status-line-items.ts';
import { ZorgnedAanvraagTransformed } from '../zorgned/zorgned-types.ts';
import {
  hasDecision,
  isAfterWCAGValidDocumentsDate,
} from './status-line-items/wmo-generic.ts';
import { WMOVoorzieningFrontend } from './wmo-config-and-types.ts';
import { wmoStatusLineItemsConfig } from './wmo-status-line-items.ts';
import { fetchZorgnedAanvragenWMO } from './wmo-zorgned-service.ts';
import { getLatestStatus, getLatestStatusDate } from '../../helpers/zaken.ts';

export function getDocuments(
  sessionID: SessionID,
  aanvraagTransformed: ZorgnedAanvraagTransformed,
  withDownloadBFFEndpoint: string
) {
  if (
    FeatureToggle.zorgnedDocumentAttachmentsActive &&
    isAfterWCAGValidDocumentsDate(aanvraagTransformed.datumAanvraag)
  ) {
    return aanvraagTransformed.documenten
      .filter((document) =>
        typeof document.isVisible !== 'undefined' ? document.isVisible : true
      )
      .map((document) => {
        const idEncrypted = encryptSessionIdWithRouteIdParam(
          sessionID,
          document.id
        );
        return {
          ...document,
          url: generateFullApiUrlBFF(withDownloadBFFEndpoint, {
            id: idEncrypted,
          }),
        };
      });
  }

  return [];
}

function transformVoorzieningenForFrontend(
  sessionID: SessionID,
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
      aanvragen,
      today
    );

    if (lineItems?.length) {
      const route = generatePath(routeConfig.detailPage.path, {
        id,
      });

      const dateDecision =
        lineItems.find((step) => step.status === 'Besluit genomen')
          ?.datePublished ?? '';

      const disclaimer = getHulpmiddelenDisclaimer(aanvraag, aanvragen);

      const voorzieningFrontend: WMOVoorzieningFrontend = {
        id,
        title: capitalizeFirstLetter(aanvraag.titel),
        supplier: aanvraag.leverancier,
        isActual: aanvraag.isActueel,
        link: {
          title: 'Meer informatie',
          to: route,
        },
        documents: getDocuments(
          sessionID,
          aanvraag,
          BffEndpoints.WMO_DOCUMENT_DOWNLOAD
        ),
        steps: lineItems,
        // NOTE: Keep! This field is added specifically for the Tips api.
        itemTypeCode: aanvraag.productsoortCode,
        decision:
          hasDecision(aanvraag) && aanvraag.resultaat
            ? capitalizeFirstLetter(aanvraag.resultaat)
            : '',
        dateDecision,
        dateDecisionFormatted: dateDecision
          ? defaultDateFormat(dateDecision)
          : '',
        displayStatus: getLatestStatus(lineItems),
        statusDate: getLatestStatusDate(lineItems),
        statusDateFormatted: getLatestStatusDate(lineItems, true),
        disclaimer,
      };

      voorzieningenFrontend.push(voorzieningFrontend);
    }
  }

  voorzieningenFrontend.sort(dateSort('statusDate', 'desc'));

  return voorzieningenFrontend;
}

export async function fetchWmo(authProfileAndToken: AuthProfileAndToken) {
  const voorzieningenResponse = await fetchZorgnedAanvragenWMO(
    authProfileAndToken.profile.id
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
};
