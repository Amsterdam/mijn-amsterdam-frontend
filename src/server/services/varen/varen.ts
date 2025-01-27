import memoize from 'memoizee';
import slug from 'slugme';

import { apiSuccessResult } from '../../../universal/helpers/api';
import { AuthProfileAndToken } from '../../auth/auth-types';
import { DEFAULT_API_CACHE_TTL_MS } from '../../config/source-api';
import { fetchDecosZaken } from '../decos/decos-service';
import { decosZaakTransformers } from './decos-zaken';
import { AppRoute, AppRoutes } from '../../../universal/config/routes';
import { Varen, VarenFrontend } from './config-and-types';
import { getStatusDate, isExpired, toDateFormatted } from '../decos/helpers';
import { defaultDateFormat } from '../../../universal/helpers/date';
import { generatePath } from 'react-router-dom';

function transformVarenVergunningFrontend(
  sessionID: SessionID,
  vergunning: Varen,
  appRoute: AppRoute
) {
  const vergunningFrontend: VarenFrontend = {
    ...vergunning,
    dateDecisionFormatted: toDateFormatted(vergunning.dateDecision),
    dateInBehandeling: getStatusDate('In behandeling', vergunning),
    dateInBehandelingFormatted: toDateFormatted(
      getStatusDate('In behandeling', vergunning)
    ),
    dateRequestFormatted: defaultDateFormat(vergunning.dateRequest),
    // Assign Status steps later on
    steps: [],
    // Adds an url with encrypted id to the BFF Detail page api for vergunningen.
    fetchUrl: 'https://mijn.amsterdam.nl', //todo
    link: {
      to: generatePath(appRoute, {
        title: slug(vergunning.caseType, {
          lower: true,
        }),
        id: vergunning.id,
      }),
      title: `Bekijk hoe het met uw aanvraag staat`,
    },
  };

  // If a vergunning has both dateStart and dateEnd add formatted dates and an expiration indication.
  if (
    'dateEnd' in vergunning &&
    'dateStart' in vergunning &&
    vergunning.dateStart &&
    vergunning.dateEnd
  ) {
    vergunningFrontend.isExpired = isExpired(vergunning);
    vergunningFrontend.dateStartFormatted = defaultDateFormat(
      vergunning.dateStart
    );
    vergunningFrontend.dateEndFormatted = defaultDateFormat(vergunning.dateEnd);
  }

  return vergunningFrontend;
}

export async function fetchVaren_(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken,
  appRoute: AppRoute = AppRoutes['VERGUNNINGEN/DETAIL']
) {
  // TODO: Do we check FeatureToggle.varenActive here or somewhere else??
  const response = await fetchDecosZaken(
    requestID,
    authProfileAndToken,
    decosZaakTransformers
  );

  if (response.status === 'OK') {
    const decosVergunningen = response.content;
    const varenVergunningFrontend: VarenFrontend[] = decosVergunningen.map(
      (vergunning) =>
        transformVarenVergunningFrontend(
          authProfileAndToken.profile.sid,
          vergunning,
          appRoute
        )
    );
    return apiSuccessResult(varenVergunningFrontend);
  }

  return response;
}

export const fetchVaren = memoize(fetchVaren_, {
  maxAge: DEFAULT_API_CACHE_TTL_MS,
  normalizer: function (args) {
    return args[0] + JSON.stringify(args[1]);
  },
});
