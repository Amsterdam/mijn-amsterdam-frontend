import { VarenFrontend } from './config-and-types';
import { fetchVaren } from './varen';
import { AppRoutes } from '../../../universal/config/routes';
import { Themas } from '../../../universal/config/thema';
import {
  apiDependencyError,
  apiSuccessResult,
} from '../../../universal/helpers/api';
import { MyNotification } from '../../../universal/types';
import { AuthProfileAndToken } from '../../auth/auth-types';

export function createVarenNotifications(
  zaak: VarenFrontend
): MyNotification | null {
  return {
    id: `varen-${zaak.id}-notification`,
    datePublished: zaak.dateRequest,
    thema: Themas.VAREN,
    title: `Aanvraag ${zaak.caseType} ontvangen`,
    description: `Wij hebben uw vergunningaanvraag ontvangen.`,
    link: {
      to: AppRoutes.VAREN,
      title: 'Bekijk details',
    },
  };
}

export async function fetchVarenNotifications(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const varenResponse = await fetchVaren(requestID, authProfileAndToken);

  if (varenResponse.status === 'ERROR') {
    return apiDependencyError({ varen: varenResponse });
  }
  const zaken = varenResponse.content.filter(
    (zaak) => zaak.caseType !== 'Varen registratie reder'
  );

  const notifications = zaken.map(createVarenNotifications).flat();

  return apiSuccessResult({
    notifications,
  });
}
