import { fetchBrpV2 } from './brp';
import { ADRES_IN_ONDERZOEK_A } from './brp-config';
import {
  themaIdBRP,
  themaTitle,
  routeConfig as routeConfigBrp,
  featureToggle,
} from '../../../client/pages/Thema/Profile/Profile-thema-config';
import {
  apiSuccessResult,
  apiDependencyError,
} from '../../../universal/helpers/api';
import { defaultDateFormat } from '../../../universal/helpers/date';
import type { MyNotification } from '../../../universal/types/App.types';
import type { AuthProfileAndToken } from '../../auth/auth-types';
import { fetchBrpNotifications } from '../profile/brp';
import type { BRPData } from '../profile/brp.types';

export function transformBRPNotifications(data: BRPData, compareDate: Date) {
  const adresInOnderzoek = data?.persoon?.adresInOnderzoek;
  const isOnbekendWaarheen = data?.persoon?.vertrokkenOnbekendWaarheen || false;
  const dateLeft = data?.persoon?.datumVertrekUitNederland
    ? defaultDateFormat(data?.persoon.datumVertrekUitNederland)
    : 'Onbekend';

  const notifications: MyNotification[] = [];

  if (adresInOnderzoek) {
    notifications.push({
      themaID: themaIdBRP,
      themaTitle: themaTitle.BRP,
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
      themaID: themaIdBRP,
      themaTitle: themaTitle.BRP,
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

export async function fetchBrpNotificationsV2(
  authProfileAndToken: AuthProfileAndToken
) {
  if (!featureToggle[themaIdBRP].benkBrpServiceActive) {
    return fetchBrpNotifications(authProfileAndToken);
  }

  const BRP = await fetchBrpV2(authProfileAndToken);

  if (BRP.status === 'OK') {
    return apiSuccessResult({
      notifications: transformBRPNotifications(BRP.content, new Date()),
    });
  }
  return apiDependencyError({ BRP });
}
