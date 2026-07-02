import { generatePath } from 'react-router';
import slug from 'slugme';

import { featureToggle, routes } from '../jzd-service-config.ts';
import {
  hasDecision,
  isAfterWCAGValidDocumentsDate,
} from './status-line-items/wmo-generic.ts';
import {
  getHulpmiddelenDisclaimer,
  hulpmiddelenDisclaimerConfig as hulpmiddelenDisclaimerConfig,
} from './status-line-items/wmo-hulpmiddelen.ts';
import { wmoStatusLineItemsConfig } from './wmo-status-line-items.ts';
import { type WMOVoorzieningFrontend } from './wmo-types.ts';
import { fetchZorgnedAanvragenWMO } from './wmo-zorgned-service.ts';
import { themaConfig } from '../../../../client/pages/Thema/Zorg/Zorg-thema-config.ts';
import { FeatureToggle } from '../../../../universal/config/feature-toggles.ts';
import {
  apiSuccessResult,
  type ApiResponse,
} from '../../../../universal/helpers/api.ts';
import {
  dateSort,
  defaultDateFormat,
} from '../../../../universal/helpers/date.ts';
import { capitalizeFirstLetter } from '../../../../universal/helpers/text.ts';
import type { StatusLineItem } from '../../../../universal/types/App.types.ts';
import type { AuthProfileAndToken } from '../../../auth/auth-types.ts';
import { encryptSessionIdWithRouteIdParam } from '../../../helpers/encrypt-decrypt.ts';
import {
  getLatestStatus,
  getLatestStatusDate,
} from '../../../helpers/zaken.ts';
import { generateFullApiUrlBFF } from '../../../routing/route-helpers.ts';
import { getStatusLineItems } from '../../zorgned/zorgned-status-line-items.ts';
import { type ZorgnedAanvraagTransformed } from '../../zorgned/zorgned-types.ts';
import type { ZorgnedAanvraagTransformedWithMaApiProps } from '../jzd-types.ts';
import { transformVoorzieningForFrontendWithMaApiProps } from '../jzd-voorzieningen-api-service.ts';

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
): WMOVoorzieningFrontend {
  const id = aanvraag.prettyID;

  const route = generatePath(themaConfig.detailPage.route.path, {
    voorziening: slug(aanvraag.titel),
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
  };

  if (disclaimer) {
    voorzieningFrontend.disclaimer = disclaimer;
  }

  return voorzieningFrontend;
}

export async function fetchWmo(
  authProfileAndToken: AuthProfileAndToken
): Promise<ApiResponse<WMOVoorzieningFrontend[]>> {
  const voorzieningenResponse = await fetchZorgnedAanvragenWMO(
    authProfileAndToken.profile.id
  );

  if (voorzieningenResponse.status !== 'OK') {
    return voorzieningenResponse;
  }

  const today = new Date();
  let voorzieningen: ZorgnedAanvraagTransformedWithMaApiProps[] =
    voorzieningenResponse.content;

  if (featureToggle.service.fetchWmo.addMaVoorzieningenApiProps) {
    const voorzieningenWithMaApiProps =
      transformVoorzieningForFrontendWithMaApiProps(
        voorzieningenResponse.content,
        undefined,
        undefined
      );
    voorzieningen = voorzieningenWithMaApiProps;
  }

  const voorzieningenFrontend: WMOVoorzieningFrontend[] = voorzieningen
    .map((aanvraag, _index, aanvragen) => {
      const steps = getStatusLineItems(
        'WMO',
        wmoStatusLineItemsConfig,
        aanvraag,
        aanvragen,
        today
      );

      if (steps) {
        const voorzieningTransformedBase = transformVoorzieningForFrontend(
          aanvraag,
          steps,
          authProfileAndToken.profile.sid,
          aanvragen
        );

        if (aanvraag.maActies) {
          return Object.assign(voorzieningTransformedBase, {
            maActies: aanvraag.maActies,
            ...(aanvraag.maActieUrls
              ? { maActieUrls: aanvraag.maActieUrls }
              : {}),
          });
        }

        return voorzieningTransformedBase;
      }

      return null;
    })
    .filter((voorziening) => voorziening !== null)
    .toSorted(dateSort('statusDate', 'desc'));

  return apiSuccessResult(voorzieningenFrontend);
}

export const forTesting = {
  transformVoorzieningForFrontend,
  getDocuments,
};
