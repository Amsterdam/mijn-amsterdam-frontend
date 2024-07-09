import { generatePath } from 'react-router-dom';
import { AppRoutes } from '../../../universal/config';
import {
  apiSuccessResult,
  defaultDateFormat,
} from '../../../universal/helpers';
import { LinkProps, StatusLineItem } from '../../../universal/types/App.types';
import { CaseType, CaseTypeV2 } from '../../../universal/types/vergunningen';
import { AuthProfileAndToken } from '../../helpers/app';
import {
  VakantieverhuurVergunning as VakantieverhuurVergunningDecos,
  Vergunning,
  VergunningenData,
  fetchVergunningen,
  toeristischeVerhuurVergunningTypes,
} from '../vergunningen/vergunningen';
import { fetchVergunningenV2 } from '../vergunningen-v2/vergunningen';
import { VergunningFrontendV2 } from '../vergunningen-v2/config-and-types';

export interface VakantieverhuurVergunning {
  datumAfhandeling?: string | null;
  datumAanvraag: string;
  datumVan: string;
  datumTot: string;
  resultaat: 'Verleend' | 'Ingetrokken' | null;
  documentenUrl: string | null;
  id: string;
  zaaknummer: string;
  link: LinkProps;
  titel: 'Vergunning vakantieverhuur';
  statussen: StatusLineItem[];
  isActief: boolean;
  adres: string;
  status: string;
}

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
      status: 'Gewijzigd',
      datePublished:
        (isVerlopen && !isIngetrokken
          ? vergunning.dateDecision ?? vergunning.dateEnd
          : vergunning.dateDecision) ?? '',
      description: isVerlopen
        ? `Uw ${vergunning.title} is verlopen.`
        : `Wij hebben uw ${vergunning.title} ingetrokken.`,
      isActive: true,
      isChecked: true,
    };

    statussen.push(statusGewijzigd);
  }

  return statussen;
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

    const vergunningTransformed: VakantieverhuurVergunning = {
      id: idTransformed,
      titel: 'Vergunning vakantieverhuur',
      datumAfhandeling: vergunning.dateDecision
        ? defaultDateFormat(vergunning.dateDecision)
        : null,
      datumAanvraag: defaultDateFormat(vergunning.dateRequest),
      datumVan: vergunning.dateStart
        ? defaultDateFormat(vergunning.dateStart)
        : '-',
      datumTot: vergunning.dateEnd
        ? defaultDateFormat(vergunning.dateEnd)
        : '-',
      adres: vergunning.location ?? '-',
      resultaat: vergunning.decision as VakantieverhuurVergunning['resultaat'],
      zaaknummer: vergunning.identifier,
      statussen: getVergunningStatussen(
        vergunning as VakantieverhuurVergunningDecos
      ),
      documentenUrl: vergunning.documentsUrl,
      link: {
        to: generatePath(AppRoutes['TOERISTISCHE_VERHUUR/VERGUNNING/VV'], {
          id: idTransformed,
        }),
        title: vergunning.link.title,
      },
      isActief: !isIngetrokken && !isVerlopen && isVerleend,
      status: vergunning.status,
    };

    vergunningenTransformed.push(vergunningTransformed);
  }

  return vergunningenTransformed;
}

export async function fetchVakantieverhuurVergunningen(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const vakantieverhuurVergunningResponse = await fetchVergunningen(
    requestID,
    authProfileAndToken,
    {
      appRoute: (vergunning: Vergunning) => {
        switch (vergunning.caseType) {
          case CaseType.VakantieverhuurVergunning:
            return AppRoutes['TOERISTISCHE_VERHUUR/VERGUNNING/VV'];
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
  requestID: requestID,
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
