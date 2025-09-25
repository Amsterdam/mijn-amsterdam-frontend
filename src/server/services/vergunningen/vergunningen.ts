import createDebugger from 'debug';

import {
  DecosVergunning,
  type PBVergunning,
  type ZaakFrontendCombined,
} from './config-and-types';
import { decosZaakTransformers } from './decos-zaken';
import { pbZaakTransformers } from './pb-zaken';
import { getStatusSteps as getStatusStepsDefault } from './vergunningen-status-steps';
import { routeConfig } from '../../../client/pages/Thema/Vergunningen/Vergunningen-thema-config';
import {
  apiErrorResult,
  ApiResponse,
  apiSuccessResult,
  getFailedDependencies,
  getSettledResult,
} from '../../../universal/helpers/api';
import type { StatusLineItem } from '../../../universal/types/App.types';
import { AuthProfileAndToken } from '../../auth/auth-types';
import {
  fetchDecosZaken,
  transformDecosZaakFrontend,
} from '../decos/decos-service';
import type { DecosZaakFrontend } from '../decos/decos-types';
import {
  fetchZaken,
  transformPBZaakFrontend,
} from '../powerbrowser/powerbrowser-service';
import type { PowerBrowserZaakFrontend } from '../powerbrowser/powerbrowser-types';

const debugDecos = createDebugger('vergunningen:decos');
const debugPB = createDebugger('vergunningen:pb');

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

export async function fetchVergunningen(
  authProfileAndToken: AuthProfileAndToken,
  appRouteDetailPage: string = routeConfig.detailPage.path
): Promise<ApiResponse<ZaakFrontendCombined[]>> {
  const requestDecos = fetchDecosZaken(
    authProfileAndToken,
    decosZaakTransformers
  );
  const requestPB = fetchZaken(authProfileAndToken.profile, pbZaakTransformers);

  const [responseDecosResult, responsePBResult] = await Promise.allSettled([
    requestDecos,
    requestPB,
  ]);

  const responseDecos = getSettledResult(responseDecosResult);
  const responsePB = getSettledResult(responsePBResult);

  debugDecos(responseDecos, 'fetchVergunningen');
  debugPB(responsePB, 'fetchZaken');

  if (responsePB.status === 'ERROR' && responseDecos.status === 'ERROR') {
    return apiErrorResult(
      'Failed to fetch vergunningen. All requests failed.',
      null
    );
  }

  let vergunningenDecos: DecosZaakFrontend[] = [];
  let vergunningenPB: PowerBrowserZaakFrontend[] = [];

  if (responseDecos.status === 'OK') {
    vergunningenDecos = responseDecos.content.map((decosZaak) =>
      transformDecosZaakFrontend<DecosVergunning>(
        authProfileAndToken.profile.sid,
        decosZaak,
        {
          detailPageRoute: appRouteDetailPage,
          includeFetchDocumentsUrl: true,
          getStepsFN: getStatusSteps,
        }
      )
    );
  }

  if (responsePB.status === 'OK') {
    vergunningenPB = responsePB.content.map((pbZaak) =>
      transformPBZaakFrontend<PBVergunning>(pbZaak, {
        detailPageRoute: appRouteDetailPage,
        // getStepsFN: getStatusSteps, // TODO: Make a custom getSteps function for PB vergunningen if needed
      })
    );
  }

  return apiSuccessResult<ZaakFrontendCombined[]>(
    [...vergunningenDecos, ...vergunningenPB],
    getFailedDependencies({
      decos: responseDecos,
      pb: responsePB,
    })
  );
}

export const forTesting = {
  transformVergunningFrontend: () => void 0,
};
