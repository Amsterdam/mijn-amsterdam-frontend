import { generatePath } from 'react-router';

import { getHulpmiddelenDisclaimer } from './status-line-items/wmo-hulpmiddelen';
import { routes } from './wmo-service-config';
import { wmoStatusLineItemsConfig } from './wmo-status-line-items';
import { routeConfig } from '../../../client/pages/Thema/Zorg/Zorg-thema-config';
import { FeatureToggle } from '../../../universal/config/feature-toggles';
import {
  apiSuccessResult,
  type ApiResponse,
} from '../../../universal/helpers/api';
import { dateSort, defaultDateFormat } from '../../../universal/helpers/date';
import { capitalizeFirstLetter } from '../../../universal/helpers/text';
import type { StatusLineItem } from '../../../universal/types/App.types';
import { AuthProfileAndToken } from '../../auth/auth-types';
import { encryptSessionIdWithRouteIdParam } from '../../helpers/encrypt-decrypt';
import { generateFullApiUrlBFF } from '../../routing/route-helpers';
import { ZorgnedAanvraagTransformed, type BSN } from '../zorgned/zorgned-types';
import {
  hasDecision,
  isAfterWCAGValidDocumentsDate,
} from './status-line-items/wmo-generic';
import {
  WMOVoorzieningFrontend,
  type WMOVoorzieningCompact,
} from './wmo-types';
import { fetchZorgnedAanvragenWMO } from './wmo-zorgned-service';
import { getLatestStatus, getLatestStatusDate } from '../../helpers/zaken';
import {
  getStatusLineItems,
  isStatusLineItemTransformerMatch,
} from '../zorgned/zorgned-status-line-items';

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

  const route = generatePath(routeConfig.detailPage.path, {
    id,
  });

  const dateDecision =
    steps.find((step) => step.status === 'Besluit genomen')?.datePublished ??
    '';

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

export type FetchWmoVoorzieningFilter = (
  voorziening: ZorgnedAanvraagTransformed,
  steps: StatusLineItem[]
) => boolean;

type FetchWmoVoorzieningenCompactOptions = {
  productGroup?: string[];
  filter?: FetchWmoVoorzieningFilter;
};

export async function fetchWmoVoorzieningenCompact(
  bsn: BSN,
  options?: FetchWmoVoorzieningenCompactOptions
): Promise<ApiResponse<WMOVoorzieningCompact[]>> {
  const voorzieningenResponse = await fetchZorgnedAanvragenWMO(bsn);

  if (voorzieningenResponse.status === 'OK') {
    const today = new Date();

    const statusLineItemsConfigsFiltered = wmoStatusLineItemsConfig.filter(
      (config) =>
        options?.productGroup
          ? options.productGroup.includes(config.statusLineItems.name)
          : true
    );

    const voorzieningenCompact: WMOVoorzieningCompact[] =
      voorzieningenResponse.content
        .map((voorziening, _index, voorzieningen) => {
          const config = statusLineItemsConfigsFiltered.find(
            (statusLineItemsConfig) =>
              isStatusLineItemTransformerMatch(
                voorziening,
                voorzieningen,
                statusLineItemsConfig
              )
          );

          if (!config) {
            return null;
          }

          const steps = getStatusLineItems(
            'WMO',
            [config],
            voorziening,
            voorzieningen,
            today
          );

          if (!steps) {
            return null;
          }

          if (options?.filter && !options.filter(voorziening, steps)) {
            return null;
          }

          const voorzieningCompact: WMOVoorzieningCompact = {
            productGroup: config?.statusLineItems.name,
            titel: capitalizeFirstLetter(voorziening.titel),
            id: voorziening.id,
            beschikkingNummer: voorziening.beschikkingNummer,
            beschiktProductIdentificatie:
              voorziening.beschiktProductIdentificatie,
            productIdentificatie: voorziening.productIdentificatie,
            datumBesluit: voorziening.datumBesluit,
            datumBeginLevering: voorziening.datumBeginLevering,
            datumEindeLevering: voorziening.datumEindeLevering,
            datumOpdrachtLevering: voorziening.datumOpdrachtLevering,
          };

          return voorzieningCompact;
        })
        .filter((voorziening) => voorziening !== null)
        .toSorted(dateSort('datumBesluit', 'desc'));

    return apiSuccessResult(voorzieningenCompact);
  }

  return voorzieningenResponse;
}

// Specific filter and fetch function for Actuele Uitgevoerde Woonruimte Aanpassingen
// consumed by Formulier app.
const WRA_PRODUCT_GROUP = 'WRA';
const WRA_STEP_STATUS = 'Aanpassing uitgevoerd';

const isActueleUitgevoerdeWoonruimteAanpassing: FetchWmoVoorzieningFilter = (
  voorziening,
  steps
) =>
  voorziening.isActueel &&
  steps.some((step) => step.status === WRA_STEP_STATUS && step.isActive);

export function fetchActueleWRAVoorzieningenCompact(
  bsn: BSN
): Promise<ApiResponse<WMOVoorzieningCompact[]>> {
  return fetchWmoVoorzieningenCompact(bsn, {
    productGroup: [WRA_PRODUCT_GROUP],
    filter: isActueleUitgevoerdeWoonruimteAanpassing,
  });
}

export const forTesting = {
  transformVoorzieningForFrontend,
  getDocuments,
};
