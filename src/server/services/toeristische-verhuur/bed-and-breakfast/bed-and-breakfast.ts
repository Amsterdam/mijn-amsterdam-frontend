import { isBefore } from 'date-fns/isBefore';
import { generatePath } from 'react-router';

import { powerBrowserZaakTransformers } from './bed-and-breakfast-pb-zaken';
import { getStatusSteps } from './bed-and-breakfast-status-steps';
import {
  BBVergunningFrontend,
  BedAndBreakfastType,
} from './bed-and-breakfast-types';
import { routeConfig } from '../../../../client/pages/Thema/ToeristischeVerhuur/ToeristischeVerhuur-thema-config';
import {
  ApiResponse,
  apiSuccessResult,
} from '../../../../universal/helpers/api';
import { AuthProfile } from '../../../auth/auth-types';
import {
  fetchZaken,
  transformPBZaakFrontend,
} from '../../powerbrowser/powerbrowser-service';

// See also: https://www.amsterdam.nl/wonen-bouwen-verbouwen/woonruimte-verhuren/oude-regels-bed-breakfast/
const DATE_NEW_REGIME_BB_RULES = '2019-01-01';

function transformBBFrontend(zaak: BedAndBreakfastType): BBVergunningFrontend {
  const appRoute = routeConfig.detailPage.path;
  const zaakTransformed = transformPBZaakFrontend(zaak, {
    detailPageRoute: appRoute,
    getStepsFN: getStatusSteps,
  });
  return {
    ...zaakTransformed,
    link: {
      to: generatePath(routeConfig.detailPage.path, {
        id: zaak.id,
        caseType: 'bed-and-breakfast',
      }),
      title: zaak.title,
    },
    heeftOvergangsRecht: zaak.dateReceived
      ? isBefore(
          new Date(zaak.dateReceived),
          new Date(DATE_NEW_REGIME_BB_RULES)
        )
      : false,
  };
}

export async function fetchBedAndBreakfast(
  authProfile: AuthProfile
): Promise<ApiResponse<BBVergunningFrontend[]>> {
  const response = await fetchZaken(authProfile, powerBrowserZaakTransformers);
  if (response.status !== 'OK') {
    return response;
  }
  const zaken = response.content;
  return apiSuccessResult(zaken.map(transformBBFrontend));
}
