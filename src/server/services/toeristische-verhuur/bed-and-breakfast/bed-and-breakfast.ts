import { isBefore } from 'date-fns/isBefore';
import { generatePath } from 'react-router';

import { powerBrowserZaakTransformers } from './bed-and-breakfast-pb-zaken.ts';
import { getStatusSteps } from './bed-and-breakfast-status-steps.ts';
import type {
  BBVergunningFrontend,
  BedAndBreakfastType,
} from './bed-and-breakfast-types.ts';
import { themaConfig } from '../../../../client/pages/Thema/ToeristischeVerhuur/ToeristischeVerhuur-thema-config.ts';
import type { ApiResponse } from '../../../../universal/helpers/api.ts';
import { apiSuccessResult } from '../../../../universal/helpers/api.ts';
import type { AuthProfile } from '../../../auth/auth-types.ts';
import {
  fetchPBZaken,
  transformPBZaakFrontend,
} from '../../powerbrowser/powerbrowser-service.ts';

// See also: https://www.amsterdam.nl/wonen-bouwen-verbouwen/woonruimte-verhuren/oude-regels-bed-breakfast/
const DATE_NEW_REGIME_BB_RULES = '2019-01-01';

function transformBBFrontend(zaak: BedAndBreakfastType): BBVergunningFrontend {
  const appRoute = themaConfig.detailPage.route.path;
  const zaakTransformed = transformPBZaakFrontend(zaak, {
    detailPageRoute: appRoute,
    getStepsFN: getStatusSteps,
  });
  return {
    ...zaakTransformed,
    link: {
      to: generatePath(themaConfig.detailPage.route.path, {
        id: zaak.id,
        caseType: 'bed-and-breakfast',
      }),
      title: zaak.title,
    },
    heeftOvergangsRecht: zaak.dateRequest
      ? isBefore(new Date(zaak.dateRequest), new Date(DATE_NEW_REGIME_BB_RULES))
      : false,
  };
}

export async function fetchBedAndBreakfast(
  authProfile: AuthProfile
): Promise<ApiResponse<BBVergunningFrontend[]>> {
  const response = await fetchPBZaken(
    authProfile,
    powerBrowserZaakTransformers
  );
  if (response.status !== 'OK') {
    return response;
  }
  const zaken = response.content;
  return apiSuccessResult(zaken.map(transformBBFrontend));
}
