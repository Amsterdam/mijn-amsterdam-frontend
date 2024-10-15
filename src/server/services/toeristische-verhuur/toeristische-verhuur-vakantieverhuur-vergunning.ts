import { generatePath } from 'react-router-dom';

import { VakantieverhuurVergunning } from './toeristische-verhuur-types';
import { AppRoutes } from '../../../universal/config/routes';
import { apiSuccessResult } from '../../../universal/helpers/api';
import {
  defaultDateFormat,
  isDateInPast,
} from '../../../universal/helpers/date';
import { StatusLineItem } from '../../../universal/types/App.types';
import { CaseType, CaseTypeV2 } from '../../../universal/types/vergunningen';
import { AuthProfileAndToken } from '../../auth/auth-types';
import {
  VakantieverhuurVergunning as VakantieverhuurVergunningDecos,
  Vergunning,
  VergunningenData,
  fetchVergunningen,
  toeristischeVerhuurVergunningTypes,
} from '../vergunningen/vergunningen';
import { fetchVergunningenV2 } from '../vergunningen-v2/vergunningen';

function getVergunningStatussen(vergunning: VakantieverhuurVergunningDecos) {
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
          ? vergunning.dateDecision ?? vergunning.dateEnd
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

function getZaakStatus(
  zaak: VakantieverhuurVergunning
): VakantieverhuurVergunning['status'] | VakantieverhuurVergunning['result'] {
  if (zaak.dateEnd && isDateInPast(zaak.dateEnd)) {
    return 'Verlopen';
  }
  if (zaak.result) {
    return zaak.result;
  }
  const lastStepStatus = zaak.steps.findLast((step) => step.isActive)
    ?.status as VakantieverhuurVergunning['status'];

  return lastStepStatus ?? 'Ontvangen';
}

export function transformVakantieverhuurVergunningen(
  vakantieverhuurVergunningen: VergunningenData
): VakantieverhuurVergunning[] {
  const vergunningenTransformed: VakantieverhuurVergunning[] = [];

  for (const vergunning of vakantieverhuurVergunningen as VakantieverhuurVergunningDecos[]) {
    // From Z/AB/123 to z-ab-123
    const idTransformed = vergunning.identifier
      .replace(/\//g, '-')
      .toUpperCase();

    const isVerleend = !!vergunning.decision
      ?.toLowerCase()
      .includes('verleend');
    const isIngetrokken = vergunning.decision
      ?.toLowerCase()
      .includes('ingetrokken');
    const isVerlopen =
      vergunning.status === 'Verlopen' ||
      (vergunning.dateEnd && new Date(vergunning.dateEnd) <= new Date());

    const title = 'Vergunning vakantieverhuur';
    const steps = getVergunningStatussen(
      vergunning as VakantieverhuurVergunningDecos
    );

    const vergunningTransformed: VakantieverhuurVergunning = {
      id: idTransformed,
      title,
      dateDecision: vergunning.dateDecision,
      dateReceived: vergunning.dateRequest,
      dateStart: vergunning.dateStart ?? '',
      dateStartFormatted: vergunning.dateStart
        ? defaultDateFormat(vergunning.dateStart)
        : '-',
      dateEnd: vergunning.dateEnd ?? '',
      dateEndFormatted: vergunning.dateEnd
        ? defaultDateFormat(vergunning.dateEnd)
        : '-',
      adres: vergunning.location ?? '-',
      result: vergunning.decision as VakantieverhuurVergunning['result'],
      zaaknummer: vergunning.identifier,
      steps,
      documents: [],
      fetchDocumentsUrl: vergunning.documentsUrl,
      link: {
        to: generatePath(AppRoutes['TOERISTISCHE_VERHUUR/VERGUNNING'], {
          id: idTransformed,
          casetype: 'vakantieverhuur',
        }),
        title: vergunning.link.title,
      },
      isActual: !isIngetrokken && !isVerlopen && isVerleend,
      status: 'Ontvangen',
    };

    vergunningTransformed.status =
      getZaakStatus(vergunningTransformed) ?? vergunningTransformed.status;

    vergunningenTransformed.push(vergunningTransformed);
  }

  return vergunningenTransformed;
}

export async function fetchVakantieverhuurVergunningen(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const vakantieverhuurVergunningResponse = await fetchVergunningen(
    requestID,
    authProfileAndToken,
    {
      appRoute: (vergunning: Vergunning) => {
        switch (vergunning.caseType) {
          case CaseType.VakantieverhuurVergunning:
            return generatePath(AppRoutes['TOERISTISCHE_VERHUUR/VERGUNNING'], {
              casetype: 'vakantieverhuur',
              id: ':id',
            });
          default:
            return AppRoutes['TOERISTISCHE_VERHUUR'];
        }
      },
      filter: (vergunning): vergunning is VakantieverhuurVergunningDecos =>
        toeristischeVerhuurVergunningTypes.includes(vergunning.caseType),
    }
  );

  if (vakantieverhuurVergunningResponse.status === 'OK') {
    return apiSuccessResult(
      transformVakantieverhuurVergunningen(
        vakantieverhuurVergunningResponse.content
      )
    );
  }

  return vakantieverhuurVergunningResponse;
}

export async function fetchVakantieverhuurVergunningenV2(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const vergunningenResponse = await fetchVergunningenV2(
    requestID,
    authProfileAndToken
  );

  if (vergunningenResponse.status === 'OK') {
    return apiSuccessResult(
      vergunningenResponse.content.filter(
        (zaak) => zaak.caseType === CaseTypeV2.VakantieverhuurVergunningaanvraag
      )
    );
  }

  return vergunningenResponse;
}
