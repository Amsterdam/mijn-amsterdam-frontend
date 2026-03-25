import { generatePath } from 'react-router';

import {
  getHulpmiddelenDisclaimer,
  hulpmiddelenDisclaimerConfig as hulpmiddelenDisclaimerConfig,
} from './status-line-items/wmo-hulpmiddelen.ts';
import { routes } from './wmo-service-config.ts';
import { wmoStatusLineItemsConfig } from './wmo-status-line-items.ts';
import { themaConfig } from '../../../client/pages/Thema/Zorg/Zorg-thema-config.ts';
import { FeatureToggle } from '../../../universal/config/feature-toggles.ts';
import { apiSuccessResult } from '../../../universal/helpers/api.ts';
import {
  dateSort,
  defaultDateFormat,
} from '../../../universal/helpers/date.ts';
import { capitalizeFirstLetter } from '../../../universal/helpers/text.ts';
import type { StatusLineItem } from '../../../universal/types/App.types.ts';
import type { AuthProfileAndToken } from '../../auth/auth-types.ts';
import { encryptSessionIdWithRouteIdParam } from '../../helpers/encrypt-decrypt.ts';
import { generateFullApiUrlBFF } from '../../routing/route-helpers.ts';
import { type ZorgnedAanvraagTransformed } from '../zorgned/zorgned-types.ts';
import {
  hasDecision,
  isAfterWCAGValidDocumentsDate,
} from './status-line-items/wmo-generic.ts';
import { type WMOVoorzieningFrontend } from './wmo-types.ts';
import { fetchZorgnedAanvragenWMO } from './wmo-zorgned-service.ts';
import { getLatestStatus, getLatestStatusDate } from '../../helpers/zaken.ts';
import { getStatusLineItems } from '../zorgned/zorgned-status-line-items.ts';

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
          url: generateFullApiUrlBFF(withDownloadBFFEndpoint, [
            {
              id: idEncrypted,
            },
          ]),
        };
      });
  }

  return [];
}

function transformVoorzieningForFrontend(
  aanvraag: ZorgnedAanvraagTransformed,
  steps: StatusLineItem[],
  sessionID: SessionID,
  aanvragen: ZorgnedAanvraagTransformed[]
): WMOVoorzieningFrontend | null {
  const id = aanvraag.prettyID;

  const route = generatePath(themaConfig.detailPage.route.path, {
    id,
  });

  const dateDecision =
    steps.find((step) => step.status === 'Besluit genomen')?.datePublished ??
    '';

  const disclaimer = getHulpmiddelenDisclaimer(
    hulpmiddelenDisclaimerConfig,
    aanvraag,
    aanvragen
  );

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
      routes.protected.WMO_DOCUMENT_DOWNLOAD
    ),
    steps,
    // NOTE: Keep! This field is added specifically for the Tips api.
    itemTypeCode: aanvraag.productsoortCode,
    decision:
      hasDecision(aanvraag) && aanvraag.resultaat
        ? capitalizeFirstLetter(aanvraag.resultaat)
        : '',
    dateDecision,
    dateDecisionFormatted: dateDecision ? defaultDateFormat(dateDecision) : '',
    displayStatus: getLatestStatus(steps),
    statusDate: getLatestStatusDate(steps),
    statusDateFormatted: getLatestStatusDate(steps, true),
    disclaimer,
  };

  return voorzieningFrontend;
}

export async function fetchWmo(authProfileAndToken: AuthProfileAndToken) {
  const voorzieningenResponse = await fetchZorgnedAanvragenWMO(
    authProfileAndToken.profile.id
  );

  if (voorzieningenResponse.status === 'OK') {
    const today = new Date();

    const voorzieningenFrontend: WMOVoorzieningFrontend[] =
      voorzieningenResponse.content
        .map((aanvraag, _index, aanvragen) => {
          const steps = getStatusLineItems(
            'WMO',
            wmoStatusLineItemsConfig,
            aanvraag,
            aanvragen,
            today
          );

          if (steps) {
            return transformVoorzieningForFrontend(
              aanvraag,
              steps,
              authProfileAndToken.profile.sid,
              aanvragen
            );
          }

          return null;
        })
        .filter((voorziening) => voorziening !== null)
        .toSorted(dateSort('statusDate', 'desc'));

    return apiSuccessResult(voorzieningenFrontend);
  }

  return voorzieningenResponse;
}

export const forTesting = {
  transformVoorzieningForFrontend,
  getDocuments,
};
