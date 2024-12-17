import { generatePath } from 'react-router-dom';

import { FeatureToggle } from '../../../universal/config/feature-toggles';
import { AppRoutes } from '../../../universal/config/routes';
import { apiSuccessResult } from '../../../universal/helpers/api';
import { dateSort, defaultDateFormat } from '../../../universal/helpers/date';
import { capitalizeFirstLetter } from '../../../universal/helpers/text';
import { StatusLineItem } from '../../../universal/types';
import { AuthProfileAndToken } from '../../auth/auth-types';
import { encryptSessionIdWithRouteIdParam } from '../../helpers/encrypt-decrypt';
import { BffEndpoints } from '../../routing/bff-routes';
import { generateFullApiUrlBFF } from '../../routing/route-helpers';
import { getStatusLineItems } from '../zorgned/zorgned-status-line-items';
import { ZorgnedAanvraagTransformed } from '../zorgned/zorgned-types';
import {
  hasDecision,
  isAfterWCAGValidDocumentsDate,
} from './status-line-items/wmo-generic';
import { WMOVoorzieningFrontend } from './wmo-config-and-types';
import { wmoStatusLineItemsConfig } from './wmo-status-line-items';
import { fetchZorgnedAanvragenWMO } from './wmo-zorgned-service';

function getDocuments(
  sessionID: SessionID,
  aanvraagTransformed: ZorgnedAanvraagTransformed
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
          url: generateFullApiUrlBFF(BffEndpoints.WMO_DOCUMENT_DOWNLOAD, {
            id: idEncrypted,
          }),
        };
      });
  }

  return [];
}

function getLatestStatusStep(steps: StatusLineItem[]): StatusLineItem | null {
  const active = steps.findLast((step) => step.isActive);
  if (active) {
    return active;
  }
  const checked = steps.findLast((step) => step.isChecked);
  if (checked) {
    return checked;
  }
  return null;
}

function getLatestStatus(steps: StatusLineItem[]) {
  return getLatestStatusStep(steps)?.status ?? 'Onbekend';
}

function getLatestStatusDate(
  steps: StatusLineItem[],
  doTransformDate: boolean = false
) {
  const date = getLatestStatusStep(steps)?.datePublished;
  if (date && doTransformDate) {
    return defaultDateFormat(date);
  }
  return date || '-';
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
      const route = generatePath(AppRoutes['ZORG/VOORZIENING'], {
        id,
      });

      const dateDecision =
        lineItems.find((step) => step.status === 'Besluit genomen')
          ?.datePublished ?? '';

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
        status: getLatestStatus(lineItems),
        statusDate: getLatestStatusDate(lineItems),
        statusDateFormatted: getLatestStatusDate(lineItems, true),
        ...(getDisclaimer(aanvraag, aanvragen) && {
          disclaimer: getDisclaimer(aanvraag, aanvragen),
        }),
      };

      voorzieningenFrontend.push(voorzieningFrontend);
    }
  }

  voorzieningenFrontend.sort(dateSort('statusDate', 'desc'));

  return voorzieningenFrontend;
}

export function getDisclaimer(
  aanvraag: ZorgnedAanvraagTransformed,
  aanvragen: ZorgnedAanvraagTransformed[]
): string | undefined {
  const matchActueleVoorziening = aanvragen.find(
    (regeling) => regeling.titel === aanvraag.titel && regeling.isActueel
  );

  const matchEerdereVoorziening = aanvragen.find(
    (regeling) => regeling.titel === aanvraag.titel && !regeling.isActueel
  );

  if (
    aanvraag.isActueel &&
    matchEerdereVoorziening?.datumEindeGeldigheid === '1-11-2024'
  ) {
    return 'Dit hulpmiddel staat per ongeluk ook bij "Eerdere en afgewezen voorzieningen". Daar vindt u het originele besluit met de juiste datums.';
  } else if (
    !aanvraag.isActueel &&
    matchActueleVoorziening?.datumIngangGeldigheid === '31-10-2024'
  ) {
    return 'Door een fout staat dit hulpmiddel ten onrechte bij Eerdere en afgewezen voorzieningen. Kijk bij "Huidige voorzieningen" of in de brief bovenaan.';
  }

  return undefined;
}

export async function fetchWmo(
  requestID: RequestID,
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
};
