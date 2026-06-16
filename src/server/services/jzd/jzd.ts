import { generatePath } from 'react-router';
import slug from 'slugme';

import { routes, type ZorgnedApiConfigKey } from './jzd-service-config.ts';
import { type JzdVoorzieningFrontend } from './jzd-types.ts';
import { fetchZorgnedAanvragenJZD } from './jzd-zorgned-service.ts';
import { isAfterWCAGValidDocumentsDate } from './wmo/status-line-items/wmo-generic.ts';
import {
  getHulpmiddelenDisclaimer,
  hulpmiddelenDisclaimerConfig as hulpmiddelenDisclaimerConfig,
} from './wmo/status-line-items/wmo-hulpmiddelen.ts';
import { DECISION_STEP_STATUS } from './wmo/wmo-config.ts';
import { themaConfig as themaConfigJeugd } from '../../../client/pages/Thema/Jeugd/Jeugd-thema-config.ts';
import { FeatureToggle } from '../../../universal/config/feature-toggles.ts';
import {
  apiSuccessResult,
  type ApiResponse,
} from '../../../universal/helpers/api.ts';
import {
  dateSort,
  defaultDateFormat,
} from '../../../universal/helpers/date.ts';
import { capitalizeFirstLetter } from '../../../universal/helpers/text.ts';
import type { StatusLineItem } from '../../../universal/types/App.types.ts';
import type { AuthProfileAndToken } from '../../auth/auth-types.ts';
import { encryptSessionIdWithRouteIdParam } from '../../helpers/encrypt-decrypt.ts';
import { getLatestStatus, getLatestStatusDate } from '../../helpers/zaken.ts';
import { generateFullApiUrlBFF } from '../../routing/route-helpers.ts';
import { getStatusLineItems } from '../zorgned/zorgned-status-line-items.ts';
import {
  type ZorgnedAanvraagTransformed,
  type ZorgnedStatusLineItemsConfig,
} from '../zorgned/zorgned-types.ts';
import { llvStatusLineItemsConfig } from './jeugd/llv-status-line-items.ts';
import { wmoStatusLineItemsConfig } from './wmo/wmo-status-line-items.ts';
import { themaConfig as themaConfigZorg } from '../../../client/pages/Thema/Zorg/Zorg-thema-config.ts';

function getDocuments(
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
  aanvragen: ZorgnedAanvraagTransformed[],
  documentDownloadRoute: string,
  frontendDetailPageRoute: string
): JzdVoorzieningFrontend | null {
  const id = aanvraag.prettyID;

  const route = generatePath(frontendDetailPageRoute, {
    voorziening: slug(aanvraag.titel),
    id,
  });

  const dateDecision =
    steps.find((step) => step.status === DECISION_STEP_STATUS)?.datePublished ??
    '';

  const disclaimer = getHulpmiddelenDisclaimer(
    hulpmiddelenDisclaimerConfig,
    aanvraag,
    aanvragen
  );

  const voorzieningFrontend: JzdVoorzieningFrontend = {
    id,
    title: capitalizeFirstLetter(aanvraag.titel),
    supplier: aanvraag.leverancier,
    isActual: aanvraag.isActueel,
    link: {
      title: 'Meer informatie',
      to: route,
    },
    documents: getDocuments(sessionID, aanvraag, documentDownloadRoute),
    steps,
    // NOTE: Keep! This field is added specifically for the Tips api.
    itemTypeCode: aanvraag.productsoortCode,
    decision:
      steps.some(
        (step) => step.status === DECISION_STEP_STATUS && step.isActive
      ) && aanvraag.resultaat
        ? capitalizeFirstLetter(aanvraag.resultaat)
        : null,
    dateDecision,
    dateDecisionFormatted: dateDecision ? defaultDateFormat(dateDecision) : '',
    displayStatus: getLatestStatus(steps),
    statusDate: getLatestStatusDate(steps),
    statusDateFormatted: getLatestStatusDate(steps, true),
    disclaimer,
  };

  return voorzieningFrontend;
}

async function fetchJzd(
  authProfileAndToken: AuthProfileAndToken,
  zorgnedApiConfigKey: ZorgnedApiConfigKey,
  documentDownloadRoute: string,
  frontendDetailPageRoute: string,
  statusLineItemsConfig: ZorgnedStatusLineItemsConfig[],
  serviceName: 'WMO' | 'LLV'
) {
  const voorzieningenResponse = await fetchZorgnedAanvragenJZD(
    authProfileAndToken.profile.id,
    zorgnedApiConfigKey
  );

  if (voorzieningenResponse.status === 'OK') {
    const today = new Date();

    const voorzieningenFrontend: JzdVoorzieningFrontend[] =
      voorzieningenResponse.content
        .map((aanvraag, _index, aanvragen) => {
          const steps = getStatusLineItems(
            serviceName,
            statusLineItemsConfig,
            aanvraag,
            aanvragen,
            today
          );

          if (serviceName === 'LLV') {
            console.log('steps', steps);
          }

          if (steps) {
            return transformVoorzieningForFrontend(
              aanvraag,
              steps,
              authProfileAndToken.profile.sid,
              aanvragen,
              documentDownloadRoute,
              frontendDetailPageRoute
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

export async function fetchWmo(
  authProfileAndToken: AuthProfileAndToken
): Promise<ApiResponse<JzdVoorzieningFrontend[]>> {
  return fetchJzd(
    authProfileAndToken,
    'ZORGNED_WMO',
    routes.protected.WMO_DOCUMENT_DOWNLOAD,
    themaConfigZorg.detailPage.route.path,
    wmoStatusLineItemsConfig,
    'WMO'
  );
}

export async function fetchLeerlingenvervoer(
  authProfileAndToken: AuthProfileAndToken
): Promise<ApiResponse<JzdVoorzieningFrontend[]>> {
  const x = await fetchJzd(
    authProfileAndToken,
    'ZORGNED_LEERLINGENVERVOER',
    routes.protected.LLV_DOCUMENT_DOWNLOAD,
    themaConfigJeugd.detailPage.route.path,
    llvStatusLineItemsConfig,
    'LLV'
  );
  console.log('fetchLeerlingenvervoer', x);
  return x;
}

export const forTesting = {
  transformVoorzieningForFrontend,
  fetchJzd,
  getDocuments,
};
