import { generatePath } from 'react-router';
import slug from 'slugme';

import {
  DecosVarenZaakVergunning,
  Varen,
  VarenRegistratieRederFrontend,
  VarenRegistratieRederType,
  VarenZakenFrontend,
} from './config-and-types';
import { decosZaakTransformers } from './decos-zaken';
import { getStatusSteps } from './varen-status-steps';
import { isVergunning } from '../../../client/pages/Thema/Varen/helper';
import { routeConfig } from '../../../client/pages/Thema/Varen/Varen-thema-config';
import { apiSuccessResult } from '../../../universal/helpers/api';
import { omit, toDateFormatted } from '../../../universal/helpers/utils';
import { AuthProfileAndToken } from '../../auth/auth-types';
import { fetchDecosZaken } from '../decos/decos-service';
import { transformDecosZaakFrontend } from '../decos/decos-service';

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
  const appRoute = routeConfig.detailPage.path;
  const zaakTransformed = transformDecosZaakFrontend(
    authProfileAndToken.profile.sid,
    zaak,
    {
      detailPageRoute: appRoute,
      includeFetchDocumentsUrl: false,
      getStepsFN: getStatusSteps,
    }
  );
  const zaakFrontend: VarenZakenFrontend = {
    ...omit(zaakTransformed, ['vergunningen']),
    vergunning: null,
  };

  if (!zaak.vergunningen || zaak.vergunningen.length === 0) {
    return [zaakFrontend];
  }

  const createZaakVergunning = (vergunning: DecosVarenZaakVergunning) => ({
    ...zaakFrontend,
    vergunning: {
      ...vergunning,
      vesselName: vergunning.vesselName || zaak.vesselName,
    },
    vesselName: vergunning.vesselName || zaak.vesselName, // The vesselName from the vergunning is leading
  });

  if (!isVergunning(zaak)) {
    // If the zaak is not a vergunning, only one vergunning can be attached
    return [createZaakVergunning(zaak.vergunningen[0])];
  }

  const zakenFrontend = zaak.vergunningen.map((vergunning) => ({
    ...createZaakVergunning(vergunning),
    id: vergunning.id,
    link: {
      to: generatePath(appRoute, {
        caseType: slug(zaak.caseType, { lower: true }),
        id: vergunning.id,
      }),
      title: `Bekijk hoe het met uw aanvraag staat`,
    },
  }));

  return zakenFrontend;
}

export async function fetchVaren(authProfileAndToken: AuthProfileAndToken) {
  const response = await fetchDecosZaken(
    authProfileAndToken,
    decosZaakTransformers
  );

  if (response.status !== 'OK') {
    return response;
  }

  const decosZaken = response.content;
  const reder = decosZaken.find(
    (zaak) => zaak.caseType === 'Varen registratie reder'
  );
  const rederFrontend = transformVarenRederFrontend(reder);

  const zakenFrontend = decosZaken
    .filter((zaak) => zaak.caseType !== 'Varen registratie reder')
    .flatMap((zaak) => transformVarenZakenFrontend(authProfileAndToken, zaak));

  return apiSuccessResult({
    reder: rederFrontend,
    zaken: zakenFrontend,
  });
}
