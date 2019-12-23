import { AppRoutes } from 'App.constants';
import { ReactComponent as AlertIcon } from 'assets/icons/Alert.svg';
import { BrpResponseData } from 'data-formatting/brp';
import { defaultDateFormat, getApiUrl } from 'helpers/App';
import { useMemo } from 'react';
import { useDataApi } from './api.hook';
import { ApiState } from './api.types';
import { MyNotification } from './my-notifications-api.hook';

export interface BrpApiState extends ApiState {
  data: BrpResponseData;
  notifications: MyNotification[];
}

export type BrpKey = keyof BrpResponseData;

export function useBrpApi(initialState = {}): BrpApiState {
  const options = { url: getApiUrl('BRP') };
  const [api] = useDataApi(options, initialState);
  const { data, ...rest } = api;

  /**
   * Below code is to ensure backward compatibility. This can be removed if adjustments in the back-end MKS api are finalized.
   */
  const formattedData = {
    ...data,
  };

  if (!!data?.verbintenis && !Array.isArray(data.verbintenis)) {
    formattedData.verbintenis = [data.verbintenis];
  }

  if (!!data?.adres && !Array.isArray(data.adres)) {
    formattedData.adres = [data.adres];
  }
  /**
   * // End backward compatibility code
   */

  const [adres] = formattedData?.adres || [];
  const inOnderzoek = adres?.inOnderzoek || false;
  const isOnbekendWaarheen =
    formattedData?.persoon?.vertrokkenOnbekendWaarheen || false;
  const dateLeft = formattedData?.persoon?.datumVertrekUitNederland
    ? defaultDateFormat(formattedData.persoon.datumVertrekUitNederland)
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
          to: AppRoutes.PROFILE,
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
          to: AppRoutes.PROFILE,
          title: 'Meer informatie',
        },
      });
    }

    return notifications;
  }, [inOnderzoek, isOnbekendWaarheen, dateLeft]);

  return { ...rest, data: formattedData, notifications };
}
