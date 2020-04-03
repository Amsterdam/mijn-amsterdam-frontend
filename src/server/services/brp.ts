import { ApiUrls, AppRoutes, Chapter } from '../../universal/config';
import { defaultDateFormat, requestSourceData } from '../../universal/helpers';

import { AxiosResponse } from 'axios';
import { MyNotification } from './services-notifications';

export interface Adres {
  straatnaam: string;
  postcode: string;
  woonplaatsNaam: string;
  huisnummer: string;
  huisnummertoevoeging: string | null;
  huisletter: string | null;
  begindatumVerblijf: string | null;
  inOnderzoek: boolean;
}

export interface Persoon {
  aanduidingNaamgebruikOmschrijving: string;
  bsn: string;
  geboortedatum: string;
  overlijdensdatum: string | null;
  geboortelandnaam: string;
  geboorteplaatsnaam: string;
  gemeentenaamInschrijving: string;
  voorvoegselGeslachtsnaam: string | null;
  geslachtsnaam: string;
  omschrijvingBurgerlijkeStaat: string;
  omschrijvingGeslachtsaanduiding: string | null;
  omschrijvingAdellijkeTitel: string | null;
  opgemaakteNaam: string;
  voornamen: string;
  nationaliteiten: Array<{ omschrijving: string }>;
  mokum: boolean;
  vertrokkenOnbekendWaarheen: boolean;
  datumVertrekUitNederland: string;
}

export interface Verbintenis {
  datumOntbinding: string | null;
  datumSluiting: string;
  landnaamSluiting: string;
  plaatsnaamSluitingOmschrijving: string;
  soortVerbintenis: string;
  soortVerbintenisOmschrijving: string;
  persoon: Persoon;
}

export interface Kind {
  bsn: string;
  geboortedatum: string;
  geslachtsaanduiding: string;
  geslachtsnaam: string;
  overlijdensdatum: string;
  voornamen: string;
  voorvoegselGeslachtsnaam: string;
}

export interface BRPData {
  persoon: Persoon;
  verbintenis?: Verbintenis;
  verbintenisHistorisch?: Verbintenis[];
  kinderen?: Kind[];
  ouders: Persoon[];
  adres: Adres;
  adresHistorisch?: Adres[];
}

export function getFullAddress(adres: Adres) {
  return `${adres.straatnaam} ${adres.huisnummer || ''} ${adres.huisletter ||
    ''} ${adres.huisnummertoevoeging || ''}`.trim();
}

export function formatBRPNotifications(data: BRPData) {
  const inOnderzoek = data?.adres?.inOnderzoek || false;
  const isOnbekendWaarheen = data?.persoon?.vertrokkenOnbekendWaarheen || false;
  const dateLeft = data?.persoon?.datumVertrekUitNederland
    ? defaultDateFormat(data?.persoon.datumVertrekUitNederland)
    : 'Onbekend';

  const notifications: MyNotification[] = [];

  if (inOnderzoek) {
    notifications.push({
      chapter: 'BURGERZAKEN' as Chapter,
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
      chapter: 'BURGERZAKEN' as Chapter,
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
}

export function formatBRPData(response: AxiosResponse<BRPData>) {
  return response.data;
}

export function fetchBRP() {
  return requestSourceData<BRPData>({ url: ApiUrls.BRP }).then(formatBRPData);
}
