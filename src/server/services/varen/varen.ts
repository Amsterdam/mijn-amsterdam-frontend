import memoize from 'memoizee';
import { generatePath } from 'react-router';
import slug from 'slugme';

import {
  Varen,
  VarenRegistratieRederFrontend,
  VarenRegistratieRederType,
  VarenZakenFrontend,
} from './config-and-types';
import { decosZaakTransformers } from './decos-zaken';
import { getStatusSteps } from './varen-status-steps';
import { isVergunning } from '../../../client/pages/Varen/helper';
import { AppRoutes } from '../../../universal/config/routes';
import { apiSuccessResult } from '../../../universal/helpers/api';
import { omit, toDateFormatted } from '../../../universal/helpers/utils';
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

function transformVarenZakenFrontend(
  authProfileAndToken: AuthProfileAndToken,
  zaak: Varen
): VarenZakenFrontend[] {
  const appRoute = AppRoutes['VAREN/DETAIL'];
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
    ...omit(zaakTransformed, ['vergunningen']),
    steps,
    vergunning: null,
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
    const zaakVergunningId = isVergunning(zaak) ? vergunning.id : zaak.id;
    return {
      ...zaakFrontend,
      vergunning,
      vesselName: vergunning.vesselName || zaak.vesselName, // The vesselName from the vergunning is leading
      id: zaakVergunningId,
      link: createLink(zaakVergunningId),
    };
  });

  return zakenFrontend;
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
      .flatMap((zaak) =>
        transformVarenZakenFrontend(authProfileAndToken, zaak)
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
