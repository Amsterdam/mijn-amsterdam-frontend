import { generatePath } from 'react-router-dom';
import { LinkProps } from '../types/App.types';
import { ExternalUrls } from './app';
import { AppRoute, AppRoutes, TrackingConfig } from './routes';
import { AppState } from '../../client/AppState';
import { Match } from '../../universal/types';
import { IS_PRODUCTION } from './env';

//import { ExternalUrls } from '../../universal/config/app';

//nieuw toegevoegd
// import { SVGComponent } from '../../universal/types';
// import { IconAVG, IconBezwaren } from '../../client/assets/icons';

// Within the team we call these Themes / Thema's
export type Thema =
  //  | 'AFVAL'

  //| 'BELASTINGEN'
  //| 'BURGERZAKEN'
  //| 'BUURT'
  //  | 'BEZWAREN'
  //| 'INKOMEN'
  // | 'STADSPAS'
  // | 'BRP'
  // | 'MILIEUZONE'
  //| 'OVERTREDINGEN'
  // | 'NOTIFICATIONS'
  | 'ROOT'
  // | 'ERFPACHT'
  //| 'ERFPACHTv2'
  // | 'ZORG'
  //| 'VERGUNNINGEN'
  //| 'SVWI'
  // | 'KVK'
  | 'SIA'
  // | 'TOERISTISCHE_VERHUUR'
  //| 'SEARCH'
  //| 'SUBSIDIE'
  //| 'PARKEREN'
  // | 'KLACHTEN'
  //| 'HORECA'
  // | 'KREFIA'
  //  | 'AVG'
  // | 'BODEM'
  | string;

// SIA is not available anymore and also ROOT is not in list below
export type ThemaIDs =
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
  | 'NOTIFICATIONS'
  | 'OVERTREDINGEN'
  | 'PARKEREN'
  | 'TOERISTISCHE_VERHUUR'
  | 'STADSPAS'
  | 'SUBSIDIE'
  | 'SEARCH'
  | 'SVWI'
  | 'VERGUNNINGEN'
  | 'ZORG'; ///let op deze bestond niet bij type Thema en zie m nu ook niet op themapagina

//NIEUW
export type inlogType = 'private' | 'commercial';

export type AppRouteInfo = {
  url: string;
  tabName: string;
  // [key in AppRoute]: string | ((config: TrackingConfig) => string);
};

type ThemaConfig = {
  title: string;

  // NOTE: If patroon c then these appRoutes are a list of first private then commercial
  appRoutes: AppRouteInfo[]; //geeft pad aan (url) EN wat in tabblad komt te staan (tabName)
  isExternal: boolean; //gaat de pagina wel of niet naar een andere (externe) site
  profileTypes: inlogType[]; //dit zijn de inlogtypes (DIGID/EHERK of BEIDE)
  isAlwaysVisible?: boolean;
  hasAppStateValue?: boolean;

  //icon: SVGComponent; // Add the themaIcon in '../../client/assets/icons' and import it.
  //isThemaActive: (state: AppState) => { return: true }; > zie app.ts
};

export const ThemaNieuw: Record<ThemaIDs, ThemaConfig> = {
  BRP: {
    title: 'Mijn gegevens',
    appRoutes: [{ url: '/persoonlijke-gegevens', tabName: `Mijn gegevens` }],
    isExternal: false,
    profileTypes: ['private'],
    //   //icon: IconMijnGegevens,
    //   //isThemaActive: (state: AppState) => { return: true }
  },

  AFVAL: {
    title: 'Afval',
    appRoutes: [{ url: '/afval', tabName: 'Afval rond uw adres' }],
    isExternal: false,
    profileTypes: ['private', 'commercial'],
    //   //icon: IconAVG,
    //   //isThemaActive: (state: AppState) => { return: true },
  },

  AVG: {
    title: 'AVG persoonsgegevens',
    appRoutes: [
      {
        url: generatePath(AppRoutes.AVG, { page: 1 }),
        tabName: ' AVG persoonsgegevens | verzoeken',
      },
      { url: '/avg/verzoek/:id', tabName: ' AVG persoonsgegevens | verzoek' },
    ],
    profileTypes: ['private', 'commercial'],
    isExternal: false,
    //icon: IconAVG,
    //isThemaActive: (state: AppState) => { return: true },
  },
  BEZWAREN: {
    title: 'Bezwaren',
    appRoutes: [
      { url: '/bezwaren', tabName: ' Bezwaren | overzicht' },
      { url: '/bezwaren/:uuid', tabName: ' Bezwaren | bezwaar' },
    ],
    isExternal: false,
    profileTypes: ['private', 'commercial'],
    //icon: IconBezwaren,
    //isThemaActive: (state: AppState) => { return: true }
  },

  BELASTINGEN: {
    title: 'Belastingen',
    appRoutes: [
      { url: ExternalUrls.SSO_BELASTINGEN, tabName: ' ' },
      { url: ExternalUrls.EH_SSO_BELASTINGEN, tabName: ' ' },
    ],
    isExternal: true,
    profileTypes: ['private', 'commercial'],
    //icon: IconBelastingen,
    //   //isThemaActive: (state: AppState) => { return: true }
    //   //isAlwaysVisible: true,  ???? > dit alleen voor commercial NAAR KIJKEN
  },

  BODEM: {
    title: 'Bodem',
    appRoutes: [
      { url: '/bodem', tabName: 'Bodem | overzicht' },
      { url: '/lood-meting/:id', tabName: 'Bodem | lood in de bodem-check' },
    ],
    isExternal: false,
    profileTypes: ['private', 'commercial'],
    //   //icon: IconBodem,
    //   //isThemaActive: (state: AppState) => { return: true }
  },

  BURGERZAKEN: {
    title: 'Burgerzaken',
    appRoutes: [
      { url: '/burgerzaken', tabName: 'Burgerzaken | overzicht' },
      { url: '/burgerzaken/id-kaart/:id', tabName: 'Burgerzaken | ID - kaart' },
      { url: '/burgerzaken/paspoort/:id', tabName: 'Burgerzaken | Paspoort' },
    ],
    isExternal: false,
    profileTypes: ['private'],
    //   //icon: IconBurgerzaken,
    //   //isThemaActive: (state: AppState) => { return: true }
  },

  BUURT: {
    title: 'Mijn Buurt',
    appRoutes: [{ url: '/buurt', tabName: 'Mijn Buurt' }],
    isExternal: false,
    profileTypes: ['private', 'commercial'],
    //   //icon:IconWior,
  },

  ERFPACHT: {
    title: 'Erfpacht',
    appRoutes: [
      { url: ExternalUrls.SSO_ERFPACHT, tabName: '' },
      { url: ExternalUrls.EH_SSO_ERFPACHT, tabName: '' },
    ],
    isExternal: true,
    profileTypes: ['private', 'commercial'],
    //   //icon:IIconErfpacht,
    //isThemaActive: (state: AppState) => { return: true }
  },

  ERFPACHTv2: {
    title: 'Erfpachtv2',
    appRoutes: [
      { url: '/erfpacht', tabName: 'Erfpacht | overzicht' },
      {
        url: `https://erfpachtzakelijk${!IS_PRODUCTION ? '-ont' : ''}.amsterdam.nl`,
        tabName: '',
      },
      {
        url: '/erfpacht/dossiers/:page?',
        tabName: 'Erfpacht | Lijst met dossiers',
      },
      {
        url: '/erfpacht/dossier/:dossierNummerUrlParam',
        tabName: 'Erfpacht | dossier',
      },
      {
        url: '/erfpacht/open-facturen/:page?',
        tabName: 'Erfpacht | Lijst met facturen',
      },
      {
        url: '/erfpacht/facturen/:dossierNummerUrlParam/:page?',
        tabName: 'Erfpacht | factuur',
      },
    ],
    isExternal: false,
    profileTypes: ['private', 'commercial'],
    //   //icon:IIconErfpacht,
    //isThemaActive: (state: AppState) => { return: true }
  },

  HORECA: {
    title: 'Horeca',
    appRoutes: [
      { url: '/horeca/', tabName: 'Horeca | overzicht' },
      { url: '/horeca/:title/:id', tabName: 'Vergunning | Horeca' },
    ],
    isExternal: false,
    profileTypes: ['private', 'commercial'],
    //   //icon: IconHoreca,
    //   //isThemaActive: (state: AppState) => { return: true }
  },
  INKOMEN: {
    title: 'Inkomen',
    appRoutes: [
      { url: '/inkomen', tabName: 'Inkomen | overzicht' },
      {
        url: '/inkomen/bijstandsuitkering/:id',
        tabName: 'Bijstandsuitkering | Inkomen',
      },
      { url: '/inkomen/tozo/:version/:id', tabName: 'Tozo | Inkomen' },
      { url: '/inkomen/tonk/:version/:id', tabName: 'TONK | Inkomen' },
      { url: '/inkomen/bbz/:version/:id', tabName: 'Bbz |Inkomen' },
      {
        url: '/inkomen/specificaties/:variant/:page?',
        tabName: 'Uitkeringsspecificaties | Inkomen',
        //LET OP deze moet nog zie routes.ts AppRoutesRedirect
      },
    ],
    isExternal: false,
    profileTypes: ['private'],
    //   //icon: IconWior,
    //   //isThemaActive: (state: AppState) => { return: true }
  },
  KLACHTEN: {
    title: 'Klachten',
    appRoutes: [
      { url: '/klachten/:page?', tabName: 'Klachten | overzicht' },
      { url: '/klachten/klacht/:id', tabName: 'Klachten | klacht' },
    ],
    isExternal: false,
    profileTypes: ['private'],
    //   //icon: IconKlachten,
    //   //isThemaActive: (state: AppState) => { return: true }
  },

  KVK: {
    title: 'Mijn onderneming',
    appRoutes: [
      { url: '/gegevens-handelsregister', tabName: `Mijn onderneming` },
    ],
    isExternal: false,
    profileTypes: ['private', 'commercial'],
    //   //icon: IconHomeCommercial,
    //   //isThemaActive: (state: AppState) => { return: true }
  },

  KREFIA: {
    title: 'Kredietbank & FIBU',
    appRoutes: [{ url: '/kredietbank-fibu', tabName: 'Kredietbank & FIBU' }],
    isExternal: false,
    profileTypes: ['private'],
    //   //icon: IconKrefia,
    //   //isThemaActive: (state: AppState) => { return: true }
  },
  MILIEUZONE: {
    //   //volgens mij hetzelfde als overtredingen > niet in prod maar geen Featuretoggle..
    title: 'Milieuzone',
    appRoutes: [{ url: ExternalUrls.SSO_MILIEUZONE, tabName: '' }], //GAAT NIET GOED!!!
    isExternal: true,
    profileTypes: ['private', 'commercial'],
    //   //icon: IconMilieuzone,
    //   //isThemaActive: (state: AppState) => { return: true }
  },

  NOTIFICATIONS: {
    title: 'Actueel',
    appRoutes: [
      { url: '/overzicht-updates/:page?', tabName: 'Actueel | Overzicht' },
    ],
    isExternal: false,
    profileTypes: ['private', 'commercial'],
    //   //icon:  IconMyNotifications,
  },

  OVERTREDINGEN: {
    //   //is deze nog op prod > zelfde als milieu ,maar deze heeft wel een FeatureToggle
    title: 'Overtredingen voertuigen',
    appRoutes: [{ url: ExternalUrls.SSO_MILIEUZONE, tabName: '' }],
    isExternal: true,
    profileTypes: ['private', 'commercial'],
    //   //icon: IconOvertredingen,
    //   //isThemaActive: (state: AppState) => { return: true }
  },

  PARKEREN: {
    title: 'Parkeren',
    appRoutes: [{ url: '/parkeren', tabName: 'Parkeren' }],
    isExternal: false,
    profileTypes: ['private', 'commercial'],
    //icon: IconParkeren,
    //isThemaActive: (state: AppState) => { return: true },
    //hasAppStateValue: false, ?? NAAR KIJKEN
  },
  TOERISTISCHE_VERHUUR: {
    title: 'Toeristische verhuur',
    //browserTabName: '| overzicht',
    appRoutes: [
      {
        url: '/toeristische-verhuur',
        tabName: 'Toeristische verhuur | overzicht',
      },
      {
        url: '/toeristische-verhuur/vergunning/:id',
        tabName: `Vergunning | Toeristische verhuur`,
      },
      {
        url: '/toeristische-verhuur/vergunning/bed-and-breakfast/:id',
        tabName: 'Vergunning Bed & Breakfast | Toeristische verhuur',
      },
      {
        url: '/toeristische-verhuur/vergunning/vakantieverhuur/:id',
        tabName: 'Vergunning vakantieverhuur | Toeristische verhuur',
      },
    ],
    isExternal: false,
    profileTypes: ['private', 'commercial'],
    //icon: IconToeristischeVerhuur,
    //isThemaActive: (state: AppState) => { return: true }
  },

  SEARCH: {
    title: 'Zoeken',
    appRoutes: [{ url: '/zoeken', tabName: 'Home | Dashboard' }],
    isExternal: false,
    profileTypes: ['private', 'commercial'],
    //icon: IconSearch,
  },

  SUBSIDIE: {
    title: 'Subsidies',
    appRoutes: [
      { url: `${ExternalUrls.SSO_SUBSIDIE}?authMethod=digid`, tabName: '' },
      {
        url: `${ExternalUrls.SSO_SUBSIDIE}?authMethod=eherkenning`,
        tabName: '',
      },
    ],
    isExternal: true,
    profileTypes: ['private', 'commercial'],
    //icon:IconSubsidie,
    //isThemaActive: (state: AppState) => { return: true }
  },

  STADSPAS: {
    title: 'Stadspas',
    appRoutes: [{ url: '/stadspas', tabName: 'Stadspas | Overzicht' }],
    isExternal: false,
    profileTypes: ['private'],
    //icon:IconStadspas,
    //isThemaActive: (state: AppState) => { return: true }
  },

  SVWI: {
    title: 'SVWI',
    appRoutes: [
      {
        url: `https://mijn.werkeninkomen${
          !IS_PRODUCTION ? '-acc' : ''
        }.amsterdam.nl/`,
        tabName: '',
      },
    ],
    isExternal: true,
    profileTypes: ['private'],
  },

  VERGUNNINGEN: {
    title: 'Vergunningen en ontheffingen',
    appRoutes: [
      {
        url: '/vergunningen',
        tabName: 'Vergunningen en ontheffingen | Overzicht',
      },
      {
        url: '/vergunningen/:title/:id',
        tabName: 'Vergunning | Vergunningen en ontheffingen',
      },
    ],
    isExternal: false,
    profileTypes: ['private', 'commercial'],
    //icon:IconVergunningen,
    //isThemaActive: (state: AppState) => { return: true }
  },

  ZORG: {
    title: 'Zorg en ondersteuning',
    appRoutes: [
      {
        url: '/zorg-en-ondersteuning',
        tabName: 'Zorg en ondersteuning | overzicht',
      },
      {
        url: '/zorg-en-ondersteuning/voorzieningen/:id',
        tabName: 'Voorziening | Zorg en ondersteuning',
      },
    ],
    isExternal: false,
    profileTypes: ['private'],
    //   //icon: IconZorg,
    //   //isThemaActive: (state: AppState) => { return: true }
  },
};

export let browserTabNames = {};
// https://sentry.io/answers/how-can-i-add-a-key-value-pair-to-a-javascript-object/

//omdat je object niet mag itereren > maak je er
Object.values(ThemaNieuw).forEach((value, index) => {
  value.appRoutes.map((appRoute) => {
    Object.assign(browserTabNames, {
      [appRoute.url]: appRoute.tabName,
    });
  });
});

export type BagThema = `${Thema}_BAG`;

// TODO kan straks weg
export const Themas: Record<Thema, Thema> = {
  AFVAL: 'AFVAL',
  BELASTINGEN: 'BELASTINGEN',
  BURGERZAKEN: 'BURGERZAKEN',
  BUURT: 'BUURT',
  BEZWAREN: 'BEZWAREN',
  INKOMEN: 'INKOMEN',
  STADSPAS: 'STADSPAS',
  SVWI: 'SVWI',
  BRP: 'BRP',
  MILIEUZONE: 'MILIEUZONE',
  OVERTREDINGEN: 'OVERTREDINGEN',
  NOTIFICATIONS: 'NOTIFICATIONS',
  ROOT: 'ROOT',
  ERFPACHT: 'ERFPACHT',
  ERFPACHTv2: 'ERFPACHTv2',
  ZORG: 'ZORG',
  VERGUNNINGEN: 'VERGUNNINGEN',
  KVK: 'KVK',
  SIA: 'SIA',
  TOERISTISCHE_VERHUUR: 'TOERISTISCHE_VERHUUR',
  KREFIA: 'KREFIA',
  SEARCH: 'SEARCH',
  SUBSIDIE: 'SUBSIDIE',
  PARKEREN: 'PARKEREN',
  KLACHTEN: 'KLACHTEN',
  HORECA: 'HORECA',
  AVG: 'AVG',
  BODEM: 'BODEM',
};

export const BagThemas: Record<Thema, BagThema> = Object.fromEntries(
  Object.entries(ThemaNieuw).map(([key]) => {
    return [key, `${key}_BAG`];
  })
);

export const ThemaTitles: Record<Thema, string> = Object.fromEntries(
  Object.entries(ThemaNieuw).map(([key, value]) => {
    return [key, value.title];
  })
);

// console.log(ThemaTitles);

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
  [AppRoutes.STADSPAS]: `Stadspas | overzicht`,
  [AppRoutes['STADSPAS/AANVRAAG']]: `Stadspas | ${ThemaTitles.INKOMEN}`,
  [AppRoutes['STADSPAS/SALDO']]: `Stadspas saldo | ${ThemaTitles.INKOMEN}`,

  [`${AppRoutes['INKOMEN/SPECIFICATIES']}/jaaropgaven`]: `Jaaropgaven | ${ThemaTitles.INKOMEN}`,

  [AppRoutes.ACCESSIBILITY]: `Toegankelijkheidsverklaring`,
  [AppRoutes.GENERAL_INFO]: `Dit ziet u in Mijn Amsterdam`,
  [AppRoutes.VERGUNNINGEN]: `${ThemaTitles.VERGUNNINGEN} | overzicht`,
  [AppRoutes['VERGUNNINGEN/DETAIL']]:
    `Vergunning | ${ThemaTitles.VERGUNNINGEN}`,

  [AppRoutes.BUURT]: `Mijn buurt`,
  [AppRoutes.NOTIFICATIONS]: `${ThemaTitles.NOTIFICATIONS} | overzicht`,

  [AppRoutes.SIA]: `${ThemaTitles.SIA} overzicht`,
  [AppRoutes['SIA/DETAIL/OPEN']]: `Melding open | ${ThemaTitles.SIA}`,
  [AppRoutes['SIA/DETAIL/CLOSED']]: `Melding afgesloten | ${ThemaTitles.SIA}`,
  [AppRoutes.SIA_OPEN]: `Meldingen | Alle openstaande meldingen`,
  [AppRoutes.SIA_CLOSED]: `Meldingen | Alle afgesloten meldingen`,
  [AppRoutes.SEARCH]: `Zoeken`,

  [AppRoutes.YIVI_LANDING]: 'Inloggen met yivi | Mijn Amsterdam',
  [AppRoutes.BFF_500_ERROR]: '500 Server Error | Mijn Amsterdam',

  [AppRoutes.ERFPACHTv2]: 'Erfpacht | overzicht',
  [AppRoutes['ERFPACHTv2/DOSSIERS']]: 'Erfpacht | Lijst met dossiers',
  [AppRoutes['ERFPACHTv2/OPEN_FACTUREN']]: 'Erfpacht | Lijst met open facturen',
  [AppRoutes['ERFPACHTv2/ALLE_FACTUREN']]: 'Erfpacht | Lijst met facturen',
  [AppRoutes['ERFPACHTv2/DOSSIERDETAIL']]: 'Erfpacht | dossier',
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

///nieuw  moet ThemamenuItem vervangen.

// value.appRoutes[0]url, is for private (DIGID) and value.appRoutes[1].url is for commercial (EHERK).
let themaMenuItems = [];
for (const [key, value] of Object.entries(ThemaNieuw)) {
  let url = value.appRoutes[0].url;

  if (key === 'BELASTINGEN' || key === 'ERFPACHTv2') {
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
  } else {
    themaMenuItems.push({
      title: value.title,
      id: key,
      to: url, // the first in this list is always the thema url
      rel: value.isExternal ? 'external' : '',
      profileTypes: value.profileTypes,
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
