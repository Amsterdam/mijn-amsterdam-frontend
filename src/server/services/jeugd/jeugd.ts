import { generatePath } from 'react-router';

import { jeugdStatusLineItemsConfig } from './status-line-items.ts';
import { routeConfig } from '../../../client/pages/Thema/Jeugd/Jeugd-thema-config.ts';
import { ApiResponse, apiSuccessResult } from '../../../universal/helpers/api.ts';
import { dateSort, defaultDateFormat } from '../../../universal/helpers/date.ts';
import { capitalizeFirstLetter } from '../../../universal/helpers/text.ts';
import {
  GenericDocument,
  ZaakDetail,
} from '../../../universal/types/App.types.ts';
import { AuthProfileAndToken } from '../../auth/auth-types.ts';
import { getLatestStatus, getLatestStatusDate } from '../../helpers/zaken.ts';
import { BffEndpoints } from '../../routing/bff-routes.ts';
import { hasDecision } from '../wmo/status-line-items/wmo-generic.ts';
import { getDocuments } from '../wmo/wmo.ts';
import { fetchAanvragen } from '../zorgned/zorgned-service.ts';
import { getStatusLineItems } from '../zorgned/zorgned-status-line-items.ts';
import {
  ProductSoortCode,
  ZorgnedAanvraagTransformed,
} from '../zorgned/zorgned-types.ts';

export async function fetchLeerlingenvervoer(
  authProfileAndToken: AuthProfileAndToken
): Promise<ApiResponse<LeerlingenvervoerVoorzieningFrontend[]>> {
  const aanvragenResponse = await fetchAanvragen(
    authProfileAndToken.profile.id,
    {
      zorgnedApiConfigKey: 'ZORGNED_LEERLINGENVERVOER',
    }
  );
  if (aanvragenResponse.status !== 'OK') {
    return aanvragenResponse;
  }

  const voorzieningen = transformVoorzieningenForFrontend(
    authProfileAndToken.profile.sid,
    aanvragenResponse.content,
    new Date()
  );
  return apiSuccessResult(voorzieningen);
}

export interface LeerlingenvervoerVoorzieningFrontend extends ZaakDetail {
  dateDecision: string;
  dateDecisionFormatted: string;
  decision: string;
  documents: GenericDocument[];
  isActual: boolean;
  itemTypeCode: ProductSoortCode;
  displayStatus:
    | 'Ontvangen'
    | 'In behandeling'
    | 'Meer informatie nodig'
    | 'Besluit genomen'
    | 'Einde recht';
  statusDate: string;
  statusDateFormatted: string;
}

function transformVoorzieningenForFrontend(
  sessionID: SessionID,
  aanvragen: ZorgnedAanvraagTransformed[],
  now: Date
): LeerlingenvervoerVoorzieningFrontend[] {
  const voorzieningenFrontend: LeerlingenvervoerVoorzieningFrontend[] = [];

  for (const aanvraag of aanvragen) {
    const lineItems = getStatusLineItems(
      'LLV',
      jeugdStatusLineItemsConfig,
      aanvraag,
      aanvragen,
      now
    );

    if (lineItems?.length) {
      const dateDecision =
        lineItems.find((step) => step.status === 'Besluit genomen')
          ?.datePublished ?? '';
      const id = aanvraag.id;
      const statusDate = getLatestStatusDate(lineItems);

      const voorzieningFrontend: LeerlingenvervoerVoorzieningFrontend = {
        id,
        title: capitalizeFirstLetter(aanvraag.titel),
        isActual: aanvraag.isActueel,
        link: {
          title: 'Meer informatie',
          to: generatePath(routeConfig.detailPage.path, {
            id,
          }),
        },
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
        documents: getDocuments(
          sessionID,
          aanvraag,
          BffEndpoints.LLV_DOCUMENT_DOWNLOAD
        ),
        displayStatus: getLatestStatus(
          lineItems
        ) as LeerlingenvervoerVoorzieningFrontend['displayStatus'],
        statusDate,
        statusDateFormatted: defaultDateFormat(statusDate),
      };

      voorzieningenFrontend.push(voorzieningFrontend);
    }
  }

  voorzieningenFrontend.sort(dateSort('statusDate', 'desc'));

  return voorzieningenFrontend;
}
