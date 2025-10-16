import { generatePath } from 'react-router';

import {
  Varen,
  VarenRegistratieRederFrontend,
  VarenRegistratieRederType,
  VarenVergunningFrontend,
  VarenZakenFrontend,
  ZaakVergunningExploitatieType,
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
import { DecosZaakTransformer } from '../decos/decos-types';

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
  zaak: Varen
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

  const vergunning = Object.fromEntries(
    entries(zaak.vergunningen[0]).filter(([_key, val]) => val != null)
  ) as (typeof zaak.vergunningen)[0];

  return {
    ...zaakFrontend,
    ...omit(vergunning, ['id', 'identifier']),
    vergunning,
  };
}

function transformVarenVergunningFrontend(
  vergunning: ZaakVergunningExploitatieType
): VarenVergunningFrontend {
  const appRoute = routeConfig.detailPageVergunning.path;
  return {
    ...omit(vergunning, ['statusDates', 'termijnDates']),
    dateStartFormatted: toDateFormatted(vergunning.dateStart),
    dateEndFormatted: toDateFormatted(vergunning.dateEnd),
    linkedActiveZaakLink: null,
    link: {
      to: generatePath(appRoute, {
        id: vergunning.id,
      }),
      title: `Bekijk uw actieve vergunning`,
    },
  };
}

export async function fetchVaren(authProfileAndToken: AuthProfileAndToken) {
  const _fetchDecosZaken = (transformers: DecosZaakTransformer[]) =>
    fetchDecosZaken(authProfileAndToken, transformers);

  const [reder, zaken, vergunningen] = await Promise.all([
    _fetchDecosZaken(decosRederZaakTransformers).then((r) => {
      if (r.status === 'OK') {
        return apiSuccessResult(transformVarenRederFrontend(r.content[0]));
      }
      return r;
    }),
    _fetchDecosZaken(decosZaakTransformers).then((r) => {
      if (r.status === 'OK') {
        return apiSuccessResult(
          r.content.flatMap((z) =>
            transformVarenZaakFrontend(authProfileAndToken, z)
          )
        );
      }
      return r;
    }),
    _fetchDecosZaken(decosVergunningTransformers).then((r) => {
      if (r.status === 'OK') {
        return apiSuccessResult(
          r.content.flatMap(transformVarenVergunningFrontend)
        );
      }
      return apiSuccessResult([]);
    }),
  ]);

  if (
    reder.status !== 'OK' ||
    zaken.status !== 'OK' ||
    vergunningen.status !== 'OK'
  ) {
    return apiErrorResult('Failed dependencies', null);
  }

  // A zaak can link to a vergunning of another reder.
  // Vergunningen contains all vergunningen that belong to this reder.
  // A vergunning is not returned if it does not belong to this reder.
  const rederVergunningenIds = vergunningen.content.map((v) => v.identifier);
  zaken.content = zaken.content.map((z) =>
    !z.vergunning || rederVergunningenIds.includes(z.vergunning.identifier)
      ? z
      : { ...z, vergunning: null }
  );

  const vergunningWithLinkedActiveZaak = vergunningen.content.map((v) => ({
    ...v,
    linkedActiveZaakLink:
      zaken.content.find(
        (z) => z.vergunning?.id === v.id && z.processed === false
      )?.link || null,
  }));

  return apiSuccessResult({
    reder: reder.content,
    zaken: zaken.content,
    vergunningen: vergunningWithLinkedActiveZaak,
  });
}
