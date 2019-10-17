import { AppRoutes } from 'App.constants';
import { ReactComponent as AlertIcon } from 'assets/icons/Alert.svg';
import { BrpResponseData } from 'data-formatting/brp';
import { defaultDateFormat, getApiUrl } from 'helpers/App';
import { useDataApi } from './api.hook';
import { ApiState } from './api.types';
import { MyNotification } from './my-notifications-api.hook';

export interface BrpApiState extends ApiState {
  data: BrpResponseData & { notifications: MyNotification[] };
}

export function useBrpApi(initialState = {}): BrpApiState {
  const options = { url: getApiUrl('BRP') };
  const [api] = useDataApi(options, initialState);
  const { data, ...rest } = api;
  const brpData = data && data.persoon ? data : {};

  const notifications: MyNotification[] = [];

  if (brpData.adres && brpData.adres.inOnderzoek) {
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

  if (brpData.persoon && brpData.persoon.vertrokkenOnbekendWaarheen) {
    const dateLeft = defaultDateFormat(new Date());
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

  return { ...rest, data: { ...brpData, notifications } };
}
