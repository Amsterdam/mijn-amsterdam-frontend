import { defaultDateFormat, getApiUrl } from '../../helpers/App';

import { ReactComponent as AlertIcon } from '../../assets/icons/Alert.svg';
import { ApiState } from './api.types';
import { AppRoutes } from '../../config/Routing.constants';
import { BrpResponseData } from '../../data-formatting/brp';
import { MyNotification } from './my-notifications-api.hook';
import { useDataApi } from './api.hook';
import { useMemo } from 'react';

export type BrpApiState = ApiState<BrpResponseData> & {
  notifications: MyNotification[];
};

export type BrpKey = keyof BrpResponseData;

export function useBrpApi(): BrpApiState {
  const options = { url: getApiUrl('BRP') };
  const [api] = useDataApi<BrpResponseData>(options, {} as BrpResponseData);
  const { data, ...rest } = api;
  const inOnderzoek = data?.adres?.inOnderzoek || false;
  const isOnbekendWaarheen = data?.persoon?.vertrokkenOnbekendWaarheen || false;
  const dateLeft = data?.persoon?.datumVertrekUitNederland
    ? defaultDateFormat(data.persoon.datumVertrekUitNederland)
    : 'Onbekend';

  const notifications = useMemo(() => {
    const notifications: MyNotification[] = [];

    if (inOnderzoek) {
      notifications.push({
        Icon: AlertIcon,
        chapter: 'BURGERZAKEN',
        datePublished: new Date().toISOString(),
        id: 'brpAdresInOnderzoek',
        title: 'Adres in onderzoek',
        description:
          'Op dit moment onderzoeken wij of u nog steeds woont op het adres waar u ingeschreven staat.',
        link: {
          to: AppRoutes.MIJN_GEGEVENS,
          title: 'Meer informatie',
        },
      });
    }

    if (isOnbekendWaarheen) {
      notifications.push({
        Icon: AlertIcon,
        chapter: 'BURGERZAKEN',
        datePublished: new Date().toISOString(),
        id: 'brpVertrokkenOnbekendWaarheen',
        title: 'Vertrokken - onbekend waarheen',
        description: `U staat sinds ${dateLeft} in Basisregistratie Personen (BRP) geregistreerd als 'vertrokken onbekend waarheen'.`,
        link: {
          to: AppRoutes.MIJN_GEGEVENS,
          title: 'Meer informatie',
        },
      });
    }

    return notifications;
  }, [inOnderzoek, isOnbekendWaarheen, dateLeft]);

  return { ...rest, data, notifications };
}
