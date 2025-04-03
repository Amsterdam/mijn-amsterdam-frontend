import memoize from 'memoizee';
import { generatePath } from 'react-router';
import slug from 'slugme';

import {
  VarenRegistratieRederFrontend,
  VarenRegistratieRederType,
  VarenZakenFrontend,
} from './config-and-types';
import { decosZaakTransformers } from './decos-zaken';
import { getStatusSteps } from './varen-status-steps';
import { AppRoutes } from '../../../universal/config/routes';
import { apiSuccessResult } from '../../../universal/helpers/api';
import { toDateFormatted } from '../../../universal/helpers/utils';
import { AuthProfileAndToken } from '../../auth/auth-types';
import { DEFAULT_API_CACHE_TTL_MS } from '../../config/source-api';
import { fetchDecosZaken } from '../decos/decos-service';
import { transformDecosZaakFrontend } from '../decos/decos-service';
import { getDisplayStatus } from '../vergunningen/vergunningen-status-steps';

function transformVarenRederFrontend(
  zaak: VarenRegistratieRederType | null | undefined
): VarenRegistratieRederFrontend | null {
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
    const appRoute = AppRoutes['VAREN/DETAIL'];
    const zakenFrontend = decosZaken
      .filter((zaak) => zaak.caseType !== 'Varen registratie reder')
      .flatMap((zaak) => {
        const steps = getStatusSteps(zaak);
        const zaakTransformed = transformDecosZaakFrontend(
          authProfileAndToken.profile.sid,
          zaak,
          {
            appRoute,
            includeFetchDocumentsUrl: false,
          }
        );
        const displayStatus = getDisplayStatus(zaakTransformed, steps);
        const zaakFrontend: VarenZakenFrontend = {
          ...zaakTransformed,
          steps,
          displayStatus,
        };

        if (!zaak.vergunningen || zaak.vergunningen.length === 0) {
          return [zaakFrontend];
        }

        const createLink = (id: string) => ({
          to: generatePath(appRoute, {
            caseType: slug(zaak.caseType, { lower: true }),
            id: id,
          }),
          title: `Bekijk hoe het met uw aanvraag staat`,
        });

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
      });
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
