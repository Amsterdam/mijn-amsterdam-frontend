import { fetchBrpByBsnTransformed } from './brp';
import { ADRES_IN_ONDERZOEK_A } from './brp-config';
import type { BrpFrontend } from './brp-types';
import {
  themaIdBRP,
  themaTitle,
  routeConfig as routeConfigBrp,
} from '../../../client/pages/Thema/Profile/Profile-thema-config';
import {
  apiSuccessResult,
  apiDependencyError,
} from '../../../universal/helpers/api';
import { defaultDateFormat } from '../../../universal/helpers/date';
import {
  NOTIFICATION_PRIORITY,
  type MyNotification,
} from '../../../universal/types/App.types';
import type { AuthProfileAndToken } from '../../auth/auth-types';

export function transformBRPNotifications(data: BrpFrontend) {
  const adresInOnderzoek = data?.persoon?.adresInOnderzoek;
  const isOnbekendWaarheen = data?.persoon?.vertrokkenOnbekendWaarheen || false;
  const dateLeft = data?.persoon?.datumVertrekUitNederland
    ? defaultDateFormat(data?.persoon.datumVertrekUitNederland)
    : null;

  const notifications: MyNotification[] = [];

  if (adresInOnderzoek) {
    notifications.push({
      themaID: themaIdBRP,
      themaTitle: themaTitle.BRP,
      datePublished: adresInOnderzoek.dateStart ?? '',
      hideDatePublished: true,
      priority: NOTIFICATION_PRIORITY.high,
      isAlert: true,
      id: 'brpAdresInOnderzoek',
      title: 'Adres in onderzoek',
      description:
        adresInOnderzoek.type === ADRES_IN_ONDERZOEK_A
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
      themaID: themaIdBRP,
      themaTitle: themaTitle.BRP,
      datePublished: dateLeft ?? '',
      hideDatePublished: true,
      isAlert: true,
      id: 'brpVertrokkenOnbekendWaarheen',
      title: 'Vertrokken Onbekend Waarheen (VOW)',
      description: `U staat sinds ${dateLeft ?? 'Onbekend'} in de Basisregistratie Personen (BRP) geregistreerd als 'vertrokken onbekend waarheen'.`,
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
      notifications: transformBRPNotifications(BRP.content),
    });
  }

  return apiDependencyError({ BRP });
}
