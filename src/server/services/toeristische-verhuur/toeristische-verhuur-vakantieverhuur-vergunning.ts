import {
  DecosVakantieverhuurVergunningaanvraag,
  VakantieverhuurVergunningaanvraag,
} from './toeristische-verhuur-config-and-types';
import { AppRoutes } from '../../../universal/config/routes';
import { apiSuccessResult } from '../../../universal/helpers/api';
import { StatusLineItem } from '../../../universal/types/App.types';
import { AuthProfileAndToken } from '../../auth/auth-types';
import {
  fetchDecosZaken,
  transformDecosZaakFrontend,
} from '../decos/decos-service';
import { VergunningFrontend } from '../vergunningen/config-and-types';

function getVergunningStatussen(vergunning: VergunningFrontend) {
  const isAfgehandeld =
    vergunning.status === 'Afgehandeld' || !!vergunning.decision;
  const isIngetrokken = vergunning.decision === 'Ingetrokken';
  const isVerlopen =
    vergunning.status === 'Verlopen' ||
    (vergunning.dateEnd && new Date(vergunning.dateEnd) <= new Date());

  const statusOntvangen: StatusLineItem = {
    id: 'step-1',
    status: 'Ontvangen',
    datePublished: vergunning.dateRequest,
    isActive: false,
    isChecked: true,
  };

  const statusInBehandeling: StatusLineItem = {
    id: 'step-2',
    status: 'In behandeling',
    datePublished: vergunning.dateRequest,
    isActive: false,
    isChecked: true,
  };

  const statusAfgehandeld: StatusLineItem = {
    id: 'step-3',
    status: 'Afgehandeld',
    datePublished: vergunning.dateDecision ?? vergunning.dateRequest ?? '',
    description: '',
    isActive: isAfgehandeld && !(isIngetrokken || isVerlopen),
    isChecked: isAfgehandeld,
  };

  const statussen = [statusOntvangen, statusInBehandeling, statusAfgehandeld];

  if (isVerlopen || isIngetrokken) {
    const statusGewijzigd: StatusLineItem = {
      id: 'step-4',
      status: isIngetrokken ? 'Ingetrokken' : 'Verlopen',
      datePublished:
        (isVerlopen && !isIngetrokken
          ? (vergunning.dateDecision ?? vergunning.dateEnd)
          : vergunning.dateDecision) ?? '',
      description: isIngetrokken
        ? `Wij hebben uw ${vergunning.title} ingetrokken.`
        : `Uw ${vergunning.title} is verlopen.`,
      isActive: true,
      isChecked: true,
    };

    statussen.push(statusGewijzigd);
  }

  return statussen;
}

export async function fetchVakantieverhuurVergunningen(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const response = await fetchDecosZaken(requestID, authProfileAndToken, [
    VakantieverhuurVergunningaanvraag,
  ]);

  if (response.status === 'OK') {
    const decosVergunningen = response.content;
    const vergunningenFrontend: VergunningFrontend<DecosVakantieverhuurVergunningaanvraag>[] =
      decosVergunningen.map((vergunning) => {
        const vergunningTransformed = transformDecosZaakFrontend(
          authProfileAndToken.profile.sid,
          vergunning,
          AppRoutes['TOERISTISCHE_VERHUUR/VERGUNNING']
        );

        return {
          ...vergunningTransformed,
          steps: getVergunningStatussen(vergunningTransformed),
        };
      });
    return apiSuccessResult(vergunningenFrontend);
  }

  return response;
}
