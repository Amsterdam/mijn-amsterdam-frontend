import { generatePath } from 'react-router';
import slug from 'slugme';

import {
  DecosVarenZaakVergunning,
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
import { isVergunning } from '../../../client/pages/Thema/Varen/helper';
import { routeConfig } from '../../../client/pages/Thema/Varen/Varen-thema-config';
import {
  apiErrorResult,
  apiSuccessResult,
} from '../../../universal/helpers/api';
import { omit, toDateFormatted } from '../../../universal/helpers/utils';
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

function transformVarenVergunningFrontend(
  vergunning: ZaakVergunningExploitatieType
): VarenVergunningFrontend {
  const appRoute = routeConfig.detailPage.path;
  return {
    ...omit(vergunning, ['statusDates', 'termijnDates']),
    dateStartFormatted: toDateFormatted(vergunning.dateStart),
    dateEndFormatted: toDateFormatted(vergunning.dateEnd),
    hasActiveZaak: false,
    link: {
      to: generatePath(appRoute, {
        caseType: slug(vergunning.itemType, { lower: true }),
        id: vergunning.id,
      }),
      title: `Bekijk hoe het met uw aanvraag staat`,
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
            transformVarenZakenFrontend(authProfileAndToken, z)
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

  const vergunningWithLinkedActiveZaak = vergunningen.content.map((v) => ({
    ...v,
    linkedActiveZaak:
      zaken.content.find(
        (z) => z.vergunning?.id === v.id && z.processed === false
      ) || null,
  }));

  return apiSuccessResult({
    reder: reder.content,
    zaken: zaken.content,
    vergunningen: vergunningWithLinkedActiveZaak,
  });
}
