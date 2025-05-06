import createDebugger from 'debug';
import memoizee from 'memoizee';

import { DecosVergunning, VergunningFrontend } from './config-and-types';
import { decosZaakTransformers } from './decos-zaken';
import { getStatusSteps as getStatusStepsDefault } from './vergunningen-status-steps';
import { routeConfig } from '../../../client/pages/Thema/Vergunningen/Vergunningen-thema-config';
import { ApiResponse, apiSuccessResult } from '../../../universal/helpers/api';
import type { StatusLineItem } from '../../../universal/types/App.types';
import { AuthProfileAndToken } from '../../auth/auth-types';
import { DEFAULT_API_CACHE_TTL_MS } from '../../config/source-api';
import {
  fetchDecosZaken,
  transformDecosZaakFrontend,
} from '../decos/decos-service';

const debug = createDebugger('vergunningen');

function getStatusSteps(vergunning: DecosVergunning): StatusLineItem[] {
  const steps = getStatusStepsDefault(vergunning);

  if (vergunning.caseType === 'RVV Sloterweg') {
    const lastStep = steps.at(-1);
    const isChangeRequest = vergunning.requestType !== 'Nieuw';

    if (lastStep?.status === 'Afgehandeld' && vergunning.isVerleend) {
      lastStep.description = isChangeRequest
        ? `Wij hebben uw kentekenwijziging voor een ${vergunning.title} verleend.`
        : `Wij hebben uw aanvraag voor een RVV ontheffing ${vergunning.area} ${vergunning.kentekens} verleend.`;
    }

    if (lastStep?.status === 'Ingetrokken') {
      lastStep.description = `Wij hebben uw RVV ontheffing ${vergunning.area} voor kenteken ${vergunning.kentekens} ingetrokken. Zie het intrekkingsbesluit voor meer informatie.`;
    }

    if (
      lastStep?.status === 'Afgehandeld' &&
      vergunning.decision === 'Vervallen'
    ) {
      lastStep.isActive = false;
      steps.push({
        status: 'Vervallen',
        id: 'step-5',
        datePublished: '',
        description: `U heeft een nieuw kenteken doorgegeven. Bekijk de ontheffing voor het nieuwe kenteken in het overzicht.`,
        isActive: true,
        isChecked: true,
      });
    }
  }

  return steps;
}

function transformVergunningFrontend(
  sessionID: SessionID,
  zaak: DecosVergunning,
  detailPageRoute: string
) {
  const zaakFrontend = transformDecosZaakFrontend<DecosVergunning>(
    sessionID,
    zaak,
    {
      detailPageRoute,
      includeFetchDocumentsUrl: true,
      getStepsFN: getStatusSteps,
    }
  );

  return zaakFrontend;
}

async function fetchVergunningen_(
  authProfileAndToken: AuthProfileAndToken,
  appRouteDetailPage: string = routeConfig.detailPage.path
): Promise<ApiResponse<VergunningFrontend[]>> {
  const response = await fetchDecosZaken(
    authProfileAndToken,
    decosZaakTransformers
  );

  debug(response, 'fetchVergunningen_');

  if (response.status === 'OK') {
    const decosZaken = response.content;
    const zakenFrontend: VergunningFrontend[] = decosZaken.map((vergunning) =>
      transformVergunningFrontend(
        authProfileAndToken.profile.sid,
        vergunning,
        appRouteDetailPage
      )
    );
    return apiSuccessResult(zakenFrontend);
  }

  return response;
}

export const fetchVergunningen = memoizee(fetchVergunningen_, {
  maxAge: DEFAULT_API_CACHE_TTL_MS,
});

export const forTesting = {
  transformVergunningFrontend,
  fetchVergunningen_,
};
