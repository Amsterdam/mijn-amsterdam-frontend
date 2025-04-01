import memoize from 'memoizee';
import { generatePath } from 'react-router-dom';
import slug from 'slugme';

import { Varen, VarenRegistratieRederType } from './config-and-types';
import { decosZaakTransformers } from './decos-zaken';
import { getStatusSteps } from './varen-status-steps';
import { AppRoute, AppRoutes } from '../../../universal/config/routes';
import { apiSuccessResult } from '../../../universal/helpers/api';
import { omit, toDateFormatted } from '../../../universal/helpers/utils';
import { AuthProfileAndToken } from '../../auth/auth-types';
import { DEFAULT_API_CACHE_TTL_MS } from '../../config/source-api';
import { fetchDecosZaken } from '../decos/decos-service';

function transformVarenZakenFrontend<T extends Varen>(
  appRoute: AppRoute,
  zaak: T
) {
  const createLink = (id: string) => ({
    to: generatePath(appRoute, {
      caseType: slug(zaak.caseType, { lower: true }),
      id: id,
    }),
    title: `Bekijk hoe het met uw aanvraag staat`,
  });
  const zaakFrontend = {
    ...omit(zaak, ['statusDates', 'termijnDates', 'vergunningen']),
    steps: getStatusSteps(zaak),
    dateRequestFormatted: toDateFormatted(zaak.dateRequest),
    dateDecisionFormatted: toDateFormatted(zaak.dateDecision),
    link: createLink(zaak.id),
  };

  if (!zaak.vergunningen || zaak.vergunningen.length === 0) {
    return [zaakFrontend];
  }

  const zakenFrontend = zaak.vergunningen.map((vergunning) => {
    const combinedIdZaakVergunning = `${zaak.id}-${vergunning.id}`;
    return {
      ...zaakFrontend,
      ...vergunning,
      id: combinedIdZaakVergunning,
      link: createLink(combinedIdZaakVergunning),
    };
  });

  return zakenFrontend;
}

function transformVarenRederFrontend(
  zaak: VarenRegistratieRederType | null | undefined
) {
  if (!zaak) {
    return null;
  }
  return {
    ...zaak,
    dateRequestFormatted: toDateFormatted(zaak.dateRequest),
  };
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
    const reder = decosZaken.find(
      (zaak) => zaak.caseType === 'Varen registratie reder'
    );
    const rederFrontend = transformVarenRederFrontend(reder);
    const zakenFrontend = decosZaken
      .filter((zaak) => zaak.caseType !== 'Varen registratie reder')
      .flatMap((vergunning) =>
        transformVarenZakenFrontend(AppRoutes['VAREN/DETAIL'], vergunning)
      );
    return apiSuccessResult({
      reder: rederFrontend,
      zaken: zakenFrontend,
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
