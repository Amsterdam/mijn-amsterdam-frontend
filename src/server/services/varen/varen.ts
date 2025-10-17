import { generatePath } from 'react-router';

import {
  Varen,
  VarenRegistratieRederFrontend,
  VarenRegistratieRederType,
  VarenVergunningExploitatieType,
  VarenVergunningFrontend,
  VarenZakenFrontend,
} from './config-and-types';
import {
  decosRederZaakTransformers,
  decosVergunningTransformers,
  decosZaakTransformers,
} from './decos-zaken';
import { getStatusSteps } from './varen-status-steps';
import { routeConfig } from '../../../client/pages/Thema/Varen/Varen-thema-config';
import {
  apiErrorResult,
  apiSuccessResult,
} from '../../../universal/helpers/api';
import {
  entries,
  omit,
  toDateFormatted,
} from '../../../universal/helpers/utils';
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

function transformVarenZaakFrontend(
  authProfileAndToken: AuthProfileAndToken,
  zaak: Varen,
  vergunningIdsOfThisReder: Set<VarenVergunningExploitatieType['identifier']>
): VarenZakenFrontend {
  const appRoute = routeConfig.detailPageZaak.path;
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
    return zaakFrontend;
  }

  // A zaak can link to a vergunning of another reder.
  // A linked vergunning not in vergunningIdsOfThisReder does not belong to this reder.
  const firstLinkedVergunningOfThisReder = zaak.vergunningen.filter((v) =>
    vergunningIdsOfThisReder.has(v.identifier)
  )[0];
  const vergunning = Object.fromEntries(
    entries(firstLinkedVergunningOfThisReder).filter(
      ([_key, val]) => val != null
    )
  ) as (typeof zaak.vergunningen)[0];

  return {
    ...zaakFrontend,
    ...omit(vergunning, ['id', 'identifier']),
    vergunning,
  };
}

function transformVarenVergunningFrontend(
  vergunning: VarenVergunningExploitatieType,
  zaken: VarenZakenFrontend[]
): VarenVergunningFrontend {
  const appRoute = routeConfig.detailPageVergunning.path;

  return {
    ...omit(vergunning, ['statusDates', 'termijnDates']),
    dateStartFormatted: toDateFormatted(vergunning.dateStart),
    dateEndFormatted: toDateFormatted(vergunning.dateEnd),
    linkedActiveZaakLink:
      zaken.find(
        (z) => z.vergunning?.id === vergunning.id && z.processed === false
      )?.link || null,
    link: {
      to: generatePath(appRoute, {
        id: vergunning.id,
      }),
      title: `Bekijk uw actieve vergunning`,
    },
  };
}

export async function fetchVaren(authProfileAndToken: AuthProfileAndToken) {
  const [rederRaw, zakenRaw, vergunningenRaw] = await Promise.all([
    fetchDecosZaken(authProfileAndToken, decosRederZaakTransformers),
    fetchDecosZaken(authProfileAndToken, decosZaakTransformers),
    fetchDecosZaken(authProfileAndToken, decosVergunningTransformers),
  ]);

  if (
    rederRaw.status !== 'OK' ||
    zakenRaw.status !== 'OK' ||
    vergunningenRaw.status !== 'OK'
  ) {
    return apiErrorResult('Failed dependencies', null);
  }

  const reder = transformVarenRederFrontend(rederRaw.content[0]);
  const zaken = zakenRaw.content.flatMap((zaak) =>
    transformVarenZaakFrontend(
      authProfileAndToken,
      zaak,
      new Set(vergunningenRaw.content.map((v) => v.identifier))
    )
  );
  const vergunningen = vergunningenRaw.content.flatMap((vergunning) =>
    transformVarenVergunningFrontend(vergunning, zaken)
  );

  return apiSuccessResult({
    reder,
    zaken,
    vergunningen,
  });
}
