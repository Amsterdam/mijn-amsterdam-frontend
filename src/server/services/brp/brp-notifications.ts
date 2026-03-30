import { ADRES_IN_ONDERZOEK_A } from './brp-config.ts';
import type { BrpFrontend } from './brp-types.ts';
import { fetchBrpByBsnTransformed } from './brp.ts';
import {
  themaConfig,
  routeConfig as routeConfigBrp,
} from '../../../client/pages/Thema/Profile/Profile-thema-config.ts';
import {
  apiSuccessResult,
  apiDependencyError,
} from '../../../universal/helpers/api.ts';
import { defaultDateFormat } from '../../../universal/helpers/date.ts';
import type { MyNotification } from '../../../universal/types/App.types.ts';
import type { AuthProfileAndToken } from '../../auth/auth-types.ts';

export function transformBRPNotifications(
  data: BrpFrontend,
  compareDate: Date
) {
  const adresInOnderzoek = data?.persoon?.adresInOnderzoek;
  const isOnbekendWaarheen = data?.persoon?.vertrokkenOnbekendWaarheen || false;
  const dateLeft = data?.persoon?.datumVertrekUitNederland
    ? defaultDateFormat(data?.persoon.datumVertrekUitNederland)
    : 'Onbekend';

  const notifications: MyNotification[] = [];

  if (adresInOnderzoek) {
    notifications.push({
      themaID: themaConfig.BRP.id,
      themaTitle: themaConfig.BRP.title,
      datePublished: compareDate.toISOString(),
      isAlert: true,
      id: 'brpAdresInOnderzoek',
      title: 'Adres in onderzoek',
      description:
        adresInOnderzoek === ADRES_IN_ONDERZOEK_A
          ? 'Op dit moment onderzoeken wij of u nog steeds woont op het adres waar u ingeschreven staat.'
          : 'Op dit moment onderzoeken wij op welk adres u nu woont.',
      link: {
        to: routeConfigBrp.themaPageBRP.path,
        title: 'Meer informatie',
      },
    });
  }

  if (isOnbekendWaarheen) {
    notifications.push({
      themaID: themaConfig.BRP.id,
      themaTitle: themaConfig.BRP.title,
      datePublished: compareDate.toISOString(),
      isAlert: true,
      id: 'brpVertrokkenOnbekendWaarheen',
      title: 'Vertrokken Onbekend Waarheen (VOW)',
      description: `U staat sinds ${dateLeft} in de Basisregistratie Personen (BRP) geregistreerd als 'vertrokken onbekend waarheen'.`,
      link: {
        to: routeConfigBrp.themaPageBRP.path,
        title: 'Meer informatie',
      },
    });
  }

  return notifications;
}

export async function fetchBrpNotifications(
  authProfileAndToken: AuthProfileAndToken
) {
  const BRP = await fetchBrpByBsnTransformed(
    authProfileAndToken.profile.sid,
    authProfileAndToken.profile.id
  );

  if (BRP.status === 'OK') {
    return apiSuccessResult({
      notifications: transformBRPNotifications(BRP.content, new Date()),
    });
  }

  return apiDependencyError({ BRP });
}
