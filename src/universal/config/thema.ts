import { LinkProps } from '../types/App.types';
import { AppRoute, AppRoutes, TrackingConfig } from './routes';
import { AppState } from '../../client/AppState';
import { inlogType, themaNieuw } from './thema-data';
import { getThemaTitleWithAppState } from '../../client/pages/HLI/helpers';
import { title } from 'process';

// SIA is not available anymore
export type Thema =
  | 'ROOT' //IS DIT WEL EEN THEMA?
  | 'AVG'
  | 'AFIS'
  | 'AFVAL'
  | 'BELASTINGEN'
  | 'BEZWAREN'
  | 'BODEM'
  | 'BUURT'
  | 'BRP'
  | 'BURGERZAKEN'
  | 'ERFPACHT'
  | 'ERFPACHTv2'
  | 'HLI'
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
      case config.profileType !== 'private-attributes' &&
        config.isAuthenticated:
        return 'Home | Dashboard';
      default:
        return 'Inloggen | Mijn Amsterdam';
    }
  },

  [`${AppRoutes['INKOMEN/SPECIFICATIES']}/jaaropgaven`]: `Jaaropgaven | ${ThemaTitles.INKOMEN}`,

  [AppRoutes.ACCESSIBILITY]: `Toegankelijkheidsverklaring`,
  [AppRoutes.GENERAL_INFO]: `Dit ziet u in Mijn Amsterdam`,

  [AppRoutes.HLI]: `Regelingen bij laag inkomen | overzicht`,
  [AppRoutes['HLI/STADSPAS']]: `Stadspas | ${ThemaTitles.HLI}`,
  [AppRoutes['HLI/REGELING']]: `Regeling | ${ThemaTitles.HLI}`,

  [AppRoutes.BUURT]: `Mijn buurt`,
  [AppRoutes.NOTIFICATIONS]: `${ThemaTitles.NOTIFICATIONS} | overzicht`,

  [AppRoutes.BFF_500_ERROR]: '500 Server Error | Mijn Amsterdam',

  [AppRoutes.API_LOGIN]: 'Inloggen | Mijn Amsterdam',
  [AppRoutes.API1_LOGIN]: 'Inloggen | Mijn Amsterdam',
  [AppRoutes.API2_LOGIN]: 'Inloggen | Mijn Amsterdam',
  ...browserTabNames,
};

export interface ThemaMenuItem extends Omit<LinkProps, 'title'> {
  id: Thema;
  profileTypes: ProfileType[];
  isAlwaysVisible?: boolean;
  hasAppStateValue?: boolean;
  title: LinkProps['title'] | ((appState: AppState) => string);
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
  } else if (key === 'HLI') {
    let title2be = (appState: AppState) => {
      return getThemaTitleWithAppState(appState);
    };
    console.log('HALLO', title2be);
    themaMenuItems.push({
      title: 'title2be',
      id: Themas.HLI,
      to: AppRoutes.HLI,
      profileTypes: ['private'] as inlogType[],
    });
  } else {
    themaMenuItems.push({
      title: value.title,
      id: key,
      to: url, // the first in this list is always the thema url
      rel: value.isExternal ? 'external' : '',
      profileTypes: value.profileTypes,
    });
  }
}

export const myThemasMenuItems: ThemaMenuItem[] = [...themaMenuItems];

// console.log(myThemasMenuItems);
