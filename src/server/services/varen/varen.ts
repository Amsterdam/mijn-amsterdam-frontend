import memoize from 'memoizee';
import { generatePath } from 'react-router-dom';
import slug from 'slugme';

import { Varen, VarenFrontend } from './config-and-types';
import { decosZaakTransformers } from './decos-zaken';
import { getStatusSteps } from './varen-status-steps';
import { AppRoute, AppRoutes } from '../../../universal/config/routes';
import { apiSuccessResult } from '../../../universal/helpers/api';
import { toDateFormatted } from '../../../universal/helpers/utils';
import { AuthProfileAndToken } from '../../auth/auth-types';
import { DEFAULT_API_CACHE_TTL_MS } from '../../config/source-api';
import { fetchDecosZaken } from '../decos/decos-service';

function transformVarenFrontend(appRoute: AppRoute, zaak: Varen) {
  const zaakFrontend: VarenFrontend = {
    ...zaak,
    steps: getStatusSteps(zaak),
    dateRequestFormatted: toDateFormatted(zaak.dateRequest),
    dateDecisionFormatted: toDateFormatted(zaak.dateDecision),
    link: {
      to: generatePath(appRoute, {
        caseType: slug(zaak.caseType, { lower: true }),
        id: zaak.id,
      }),
      title: `Bekijk hoe het met uw aanvraag staat`,
    },
  };

  return zaakFrontend;
}

async function fetchVaren_(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const response = await fetchDecosZaken(
    requestID,
    authProfileAndToken,
    decosZaakTransformers
  );

  if (response.status === 'OK') {
    const decosZaken = response.content;
    const registratieReder =
      decosZaken.find((zaak) => zaak.caseType === 'Varen registratie reder') ??
      null;
    const zaken = decosZaken.filter(
      (zaak) => zaak.caseType !== 'Varen registratie reder'
    );
    const varenVergunningFrontend = zaken.map((vergunning) =>
      transformVarenFrontend(AppRoutes['VAREN/DETAIL'], vergunning)
    );
    return apiSuccessResult({
      reder: registratieReder,
      zaken: varenVergunningFrontend,
    });
  }

  return response;
}

export const fetchVaren = memoize(fetchVaren_, {
  maxAge: DEFAULT_API_CACHE_TTL_MS,
  normalizer: function (args) {
    return args[0] + JSON.stringify(args[1]);
  },
});
