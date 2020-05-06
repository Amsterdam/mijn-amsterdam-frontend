import { ReactComponent as AlertIcon } from 'assets/icons/Alert.svg';
import { AppRoutes } from 'config/Routing.constants';
import { BrpResponseData } from 'data-formatting/brp';
import { defaultDateFormat, getApiUrl } from 'helpers/App';
import { useMemo } from 'react';
import { useDataApi } from './api.hook';
import { ApiState } from './api.types';
import { MyNotification } from './my-notifications-api.hook';
import { generatePath } from 'react-router-dom';
import { differenceInCalendarDays } from 'date-fns';

export type BrpApiState = ApiState<BrpResponseData> & {
  notifications: MyNotification[];
};

export type BrpKey = keyof Omit<BrpResponseData, 'identiteitsbewijzen'>;

const options = { url: getApiUrl('BRP') };

const BrpDocumentTitles: Record<string, string> = {
  paspoort: 'paspoort',
  'europese identiteitskaart': 'ID-kaart',
  rijbewijs: 'rijbewijs',
};

const BrpDocumentCallToAction: Record<
  'isExpired' | 'willExpire',
  Record<string, string>
> = {
  isExpired: {
    paspoort:
      'https://www.amsterdam.nl/burgerzaken/paspoort-en-idkaart/paspoort-aanvragen/',
    'europese identiteitskaart':
      'https://www.amsterdam.nl/burgerzaken/paspoort-en-idkaart/id-kaart-aanvragen/',
    rijbewijs: '',
  },
  willExpire: {
    paspoort:
      'https://www.amsterdam.nl/burgerzaken/paspoort-en-idkaart/paspoort-aanvragen/',
    'europese identiteitskaart':
      'https://www.amsterdam.nl/burgerzaken/paspoort-en-idkaart/id-kaart-aanvragen/',
    rijbewijs: '',
  },
};

export function useBrpApi(): BrpApiState {
  const [api] = useDataApi<BrpResponseData>(options, {} as BrpResponseData);
  const { data, ...rest } = api;
  const inOnderzoek = data?.adres?.inOnderzoek || false;
  const isOnbekendWaarheen = data?.persoon?.vertrokkenOnbekendWaarheen || false;
  const dateLeft = data?.persoon?.datumVertrekUitNederland
    ? defaultDateFormat(data.persoon.datumVertrekUitNederland)
    : 'Onbekend';

  const dataFormatted = useMemo(() => {
    if (!data.identiteitsbewijzen) {
      return data;
    }
    return Object.assign({}, data, {
      identiteitsbewijzen: data.identiteitsbewijzen.map(document => {
        const route = generatePath(AppRoutes.BURGERZAKEN_DOCUMENT, {
          id: document.documentNummer,
        });
        return Object.assign({}, document, {
          title:
            BrpDocumentTitles[document.documentType] || document.documentType,
          datumAfloop: defaultDateFormat(document.datumAfloop),
          datumUitgifte: defaultDateFormat(document.datumUitgifte),
          link: {
            to: route,
            title: document.documentType,
          },
        });
      }),
    });
  }, [data]);

  const notifications = useMemo(() => {
    const notifications: MyNotification[] = [];

    const expiredDocuments =
      !!data.identiteitsbewijzen &&
      data.identiteitsbewijzen.filter(
        document => new Date(document.datumAfloop) < new Date()
      );
    const willExpireSoonDocuments =
      !!data.identiteitsbewijzen &&
      data.identiteitsbewijzen.filter(document => {
        const days = differenceInCalendarDays(
          new Date(document.datumAfloop),
          new Date()
        );

        return days <= 120 && days > 0;
      });

    if (!!expiredDocuments && expiredDocuments.length) {
      expiredDocuments.forEach(document => {
        const docTitle =
          BrpDocumentTitles[document.documentType] || document.documentType;
        notifications.push({
          Icon: AlertIcon,
          chapter: 'BURGERZAKEN',
          datePublished: new Date().toISOString(),
          hideDatePublished: true,
          id: `${docTitle}-datum-afloop-verstreken`,
          title: `Uw ${docTitle} is verlopen`,
          description: `Sinds ${defaultDateFormat(
            document.datumAfloop
          )} is uw ${docTitle} niet meer geldig.`,
          link: {
            to: BrpDocumentCallToAction.isExpired[document.documentType],
            title: `Vraag snel uw nieuwe ${docTitle} aan`,
          },
        });
      });
    }

    if (!!willExpireSoonDocuments && willExpireSoonDocuments.length) {
      willExpireSoonDocuments.forEach(document => {
        const docTitle =
          BrpDocumentTitles[document.documentType] || document.documentType;
        notifications.push({
          Icon: AlertIcon,
          chapter: 'BURGERZAKEN',
          datePublished: new Date().toISOString(),
          hideDatePublished: true,
          id: `${document.documentType}-datum-afloop-binnekort`,
          title: `Uw ${docTitle} verloopt binnenkort`,
          description: `Vanaf ${defaultDateFormat(
            document.datumAfloop
          )} is uw ${docTitle} niet meer geldig.`,
          link: {
            to: BrpDocumentCallToAction.isExpired[document.documentType],
            title: `Vraag snel uw nieuwe ${docTitle} aan`,
          },
        });
      });
    }

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
  }, [inOnderzoek, isOnbekendWaarheen, dateLeft, data]);

  return { ...rest, data: dataFormatted, notifications };
}
