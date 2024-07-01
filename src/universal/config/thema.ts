import { generatePath } from 'react-router-dom';
import { LinkProps } from '../types/App.types';
import { ExternalUrls } from './app';
import { AppRoute, AppRoutes, TrackingConfig } from './routes';
import { AppState } from '../../client/AppState';
import { Match } from '../../universal/types';
import { IS_PRODUCTION } from './env';
import { url } from 'node:inspector';
import { inlogType, themaNieuw } from './thema-data';

//import { ExternalUrls } from '../../universal/config/app';

// 1. Kan zorg, subsidies en  stadspas niet testen
// 2. type is hiet met een hoofdletter is  dit niet inconsequent: AppRouteInfo of is deze niet ok inlogType
// 2. Wanneer je naar de console log kijkt wordt uitsluitend de eerste url gepakt,
//ZIJN ROOT SEARCH EN NOTIFICATION WEL THEMA"S?????

// Within the team we call these Themes / Thema's
//export type Thema = string;

// SIA is not available anymore
export type Thema =
  | 'ROOT' //IS DIT WEL EEN THEMA?
  | 'AVG'
  | 'AFVAL'
  | 'BELASTINGEN'
  | 'BEZWAREN'
  | 'BODEM'
  | 'BUURT'
  | 'BRP'
  | 'BURGERZAKEN'
  | 'ERFPACHT'
  | 'ERFPACHTv2'
  | 'HORECA'
  | 'INKOMEN'
  | 'KLACHTEN'
  | 'KREFIA'
  | 'KVK'
  | 'MILIEUZONE'
  | 'NOTIFICATIONS' //IS DIT WEL EEN THEMA?
  | 'OVERTREDINGEN'
  | 'PARKEREN'
  | 'TOERISTISCHE_VERHUUR'
  | 'STADSPAS'
  | 'SUBSIDIE'
  | 'SEARCH' //IS DIT WEL EEN THEMA?
  | 'SVWI'
  | 'VERGUNNINGEN'
  | 'ZORG'
  | string;

export let browserTabNames = {};
// https://sentry.io/answers/how-can-i-add-a-key-value-pair-to-a-javascript-object/

//omdat je object niet mag itereren > maak je er
Object.values(themaNieuw).forEach((value, index) => {
  value.appRoutes.map((appRoute) => {
    Object.assign(browserTabNames, {
      [appRoute.url]: appRoute.tabName,
    });
  });
});

export type BagThema = `${Thema}_BAG`;

export const BagThemas: Record<Thema, BagThema> = Object.fromEntries(
  Object.entries(themaNieuw).map(([key]) => {
    return [key, `${key}_BAG`];
  })
);

export const ThemaTitles: Record<Thema, string> = Object.fromEntries(
  Object.entries(themaNieuw).map(([key, value]) => {
    return [key, value.title];
  })
);

export const Themas: Record<Thema, Thema> = Object.fromEntries(
  Object.entries(themaNieuw).map(([key]) => {
    return [key, key];
  })
);

export const NOT_FOUND_TITLE = 'Pagina niet gevonden';
export const DocumentTitleMain = 'Mijn Amsterdam';
export const PageTitleMain = 'Mijn Amsterdam';

// Used in <html><head><title>{PageTitle}</title></head>
export const DocumentTitles: {
  [key in AppRoute]: string | ((config: TrackingConfig) => string);
} = {
  [AppRoutes.ROOT]: (config) => {
    switch (true) {
      case config.profileType === 'private-attributes' &&
        config.isAuthenticated:
        return 'Home | Meldingen overzicht';
      case config.profileType === 'private-attributes' &&
        !config.isAuthenticated:
        return 'Inloggen met yivi | Mijn Amsterdam';
      case config.profileType !== 'private-attributes' &&
        config.isAuthenticated:
        return 'Home | Dashboard';
      default:
        return 'Inloggen | Mijn Amsterdam';
    }
  },

  //einde inkomen moet verwerkt worden
  // [AppRoutes.STADSPAS]: `Stadspas | overzicht`,
  // [AppRoutes['STADSPAS/AANVRAAG']]: `Stadspas | ${ThemaTitles.INKOMEN}`,
  // [AppRoutes['STADSPAS/SALDO']]: `Stadspas saldo | ${ThemaTitles.INKOMEN}`,

  [`${AppRoutes['INKOMEN/SPECIFICATIES']}/jaaropgaven`]: `Jaaropgaven | ${ThemaTitles.INKOMEN}`,

  [AppRoutes.ACCESSIBILITY]: `Toegankelijkheidsverklaring`,
  [AppRoutes.GENERAL_INFO]: `Dit ziet u in Mijn Amsterdam`,
  // [AppRoutes.VERGUNNINGEN]: `${ThemaTitles.VERGUNNINGEN} | overzicht`,
  // [AppRoutes['VERGUNNINGEN/DETAIL']]:
  //   `Vergunning | ${ThemaTitles.VERGUNNINGEN}`,

  [AppRoutes.BUURT]: `Mijn buurt`,
  [AppRoutes.NOTIFICATIONS]: `${ThemaTitles.NOTIFICATIONS} | overzicht`,

  // [AppRoutes.SIA]: `${ThemaTitles.SIA} overzicht`,
  // [AppRoutes['SIA/DETAIL/OPEN']]: `Melding open | ${ThemaTitles.SIA}`,
  // [AppRoutes['SIA/DETAIL/CLOSED']]: `Melding afgesloten | ${ThemaTitles.SIA}`,
  // [AppRoutes.SIA_OPEN]: `Meldingen | Alle openstaande meldingen`,
  // [AppRoutes.SIA_CLOSED]: `Meldingen | Alle afgesloten meldingen`,
  // [AppRoutes.SEARCH]: `Zoeken`,

  // [AppRoutes.YIVI_LANDING]: 'Inloggen met yivi | Mijn Amsterdam',
  [AppRoutes.BFF_500_ERROR]: '500 Server Error | Mijn Amsterdam',

  // [AppRoutes.ERFPACHTv2]: 'Erfpacht | overzicht',
  // [AppRoutes['ERFPACHTv2/DOSSIERS']]: 'Erfpacht | Lijst met dossiers',
  // [AppRoutes['ERFPACHTv2/OPEN_FACTUREN']]: 'Erfpacht | Lijst met open facturen',
  // [AppRoutes['ERFPACHTv2/ALLE_FACTUREN']]: 'Erfpacht | Lijst met facturen',
  // [AppRoutes['ERFPACHTv2/DOSSIERDETAIL']]: 'Erfpacht | dossier',
  [AppRoutes.API_LOGIN]: 'Inloggen | Mijn Amsterdam',
  [AppRoutes.API1_LOGIN]: 'Inloggen | Mijn Amsterdam',
  [AppRoutes.API2_LOGIN]: 'Inloggen | Mijn Amsterdam',
  ...browserTabNames,
};

export interface ThemaMenuItem extends LinkProps {
  id: Thema;
  profileTypes: ProfileType[];
  isAlwaysVisible?: boolean;
  hasAppStateValue?: boolean;
}

// value.appRoutes[0]url, is for private (DIGID) and value.appRoutes[1].url is for commercial (EHERK).
let themaMenuItems = [];
for (const [key, value] of Object.entries(themaNieuw)) {
  let url = value.appRoutes[0].url;
  if (key === 'BELASTINGEN') {
    themaMenuItems.push({
      title: value.title,
      id: key,
      to: value.appRoutes[0].url, // the first in this list is always the thema url
      rel: value.isExternal ? 'external' : '',
      profileTypes: ['private'] as inlogType[],
    });
    themaMenuItems.push({
      title: value.title,
      id: key,
      to: value.appRoutes[1].url,
      rel: value.isExternal ? 'external' : '',
      isAlwaysVisible: true,
      profileTypes: ['commercial'] as inlogType[],
    });
  } else if (key === 'ERFPACHTv2') {
    themaMenuItems.push({
      title: value.title,
      id: key,
      to: value.appRoutes[0].url, // the first in this list is always the thema url
      rel: '',
      profileTypes: ['private'] as inlogType[],
    });
    themaMenuItems.push({
      title: value.title,
      id: key,
      to: value.appRoutes[1].url,
      rel: 'external',
      profileTypes: ['commercial'] as inlogType[],
    });
  } else if (key === 'PARKEREN') {
    themaMenuItems.push({
      title: value.title,
      id: key,
      to: value.appRoutes[0].url, // the first in this list is always the thema url
      rel: value.isExternal ? 'external' : '',
      profileTypes: ['private'] as inlogType[],
      hasAppStateValue: false,
    });
    themaMenuItems.push({
      title: value.title,
      id: key,
      to: value.appRoutes[0].url, // the first in this list is always the thema url
      rel: value.isExternal ? 'external' : '',
      profileTypes: ['commercial'] as inlogType[],
      hasAppStateValue: false,
    });
  } else {
    themaMenuItems.push({
      title: value.title,
      id: key,
      to: url, // the first in this list is always the thema url
      rel: value.isExternal ? 'external' : '',
      profileTypes: value.profileTypes,
      //isAlwaysVisible: value,
      //asAppStateValue: value,
    });
  }

  // let externalCommercialUrl = value.isExternal ? value.appRoutes[1].url : null;
  // if (externalCommercialUrl) {
  //   themaMenuItems.push({
  //     title: value.title,
  //     id: key,
  //     to: externalCommercialUrl, // the first in this list is always the thema url
  //     profileTypes: value.profileTypes,
  //   });
  // }
}

//einde nieuw
export const myThemasMenuItems: ThemaMenuItem[] = [...themaMenuItems];

console.log(myThemasMenuItems);
