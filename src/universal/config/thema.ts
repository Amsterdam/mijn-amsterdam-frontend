import { generatePath } from 'react-router-dom';
import { LinkProps } from '../types/App.types';
import { ExternalUrls } from './app';
import { AppRoute, AppRoutes, TrackingConfig } from './routes';
import { AppState } from '../../client/AppState';
import { Match } from '../../universal/types';

//import { ExternalUrls } from '../../universal/config/app';

//nieuw toegevoegd
// import { SVGComponent } from '../../universal/types';
// import { IconAVG, IconBezwaren } from '../../client/assets/icons';

// Within the team we call these Themes / Thema's
export type Thema =
  //  | 'AFVAL'

  // | 'BELASTINGEN'
  //| 'BURGERZAKEN'
  | 'BUURT'
  //  | 'BEZWAREN'
  | 'INKOMEN'
  | 'STADSPAS'
  // | 'BRP'
  // | 'MILIEUZONE'
  //| 'OVERTREDINGEN'
  | 'NOTIFICATIONS'
  | 'ROOT'
  | 'ERFPACHT'
  | 'ERFPACHTv2'
  // | 'ZORG'
  | 'VERGUNNINGEN'
  | 'SVWI'
  // | 'KVK'
  | 'SIA'
  // | 'TOERISTISCHE_VERHUUR'
  | 'SEARCH'
  | 'SUBSIDIE'
  //| 'PARKEREN'
  // | 'KLACHTEN'
  //| 'HORECA'
  // | 'KREFIA'
  //  | 'AVG'
  // | 'BODEM'
  | string;

export type ThemaIDs =
  | 'AVG'
  | 'AFVAL'
  // | 'BELASTINGEN'
  | 'BEZWAREN'
  | 'BODEM'
  | 'BRP'
  | 'BURGERZAKEN'
  | 'HORECA'
  | 'INKOMEN'
  | 'KLACHTEN'
  | 'KREFIA'
  | 'KVK'
  | 'MILIEUZONE'
  | 'OVERTREDINGEN'
  | 'PARKEREN'
  | 'TOERISTISCHE_VERHUUR'
  | 'ZORG';

export type inlogType = 'private' | 'commercial';

export type AppRouteInfo = {
  url: string;
  tabName: string;
  // [key in AppRoute]: string | ((config: TrackingConfig) => string);
};

type ThemaConfig = {
  title: string;
  appRoutes: AppRouteInfo[]; //geeft pad aan en wat in tabblad komt te staan
  isExternal: boolean; //gaat de pagina wel of niet naar een andere (externe) site
  profileTypes: inlogType[]; //dit zijn de inlogtypes (DIGID/EHERK of BEIDE)
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

  // BELASTINGEN: {
  //   //nog een voor Eherk
  //   title: 'Belastingen',
  //   browserTabName: 'none',
  //   browserTabNameDetail: 'none',
  //   appRoute: ExternalUrls.SSO_BELASTINGEN,
  //   appRouteDetail: 'none',
  //   isExternal: 'extern', //wanneer extern opnemen url opnemen in app.ts > doet het niet plakt het erachter..
  //   profileTypes: ['private'],
  //   //icon: IconBelastingen,
  //   //isThemaActive: (state: AppState) => { return: true }
  // },

  // // BELASTINGEN: {
  // //     title: 'Belastingen',
  // //   browserTabName: 'none',
  // //   browserTabNameDetail: 'none',
  // //   appRoute: ExternalUrls.EH_SSO_BELASTINGEN,
  // //   appRouteDetail: 'none',
  // //   isExternal: 'extern', //wanneer extern opnemen url opnemen in app.ts > doet het niet plakt het erachter..
  // //   profileTypes: ['commercial'],
  // //   //icon: IconBelastingen,
  // //   //isThemaActive: (state: AppState) => { return: true }
  // //   //isAlwaysVisible: true,  ????
  // // },

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
        //LET OP deze moet nog zie routes.ts AppRoutesRediect
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
  OVERTREDINGEN: {
    //   //is deze nog op prod > zelfde als miliee ,maar deze heeft wel een Feautiretoggle
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
    //   appRoutes: [{ url: '/parkeren', tabName: '' }],
    //   //   browserTabName: '',
    //   //   browserTabNameDetail: 'none',
    //   //   appRoute: '/parkeren',
    //   //   appRouteDetail: 'none',
    isExternal: false,
    profileTypes: ['private', 'commercial'],
    //icon: IconParkeren,
    //isThemaActive: (state: AppState) => { return: true },
    //hasAppStateValue: false, ??
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
  // consol¿e.log(value);
  value.appRoutes.map((appRoute) => {
    Object.assign(browserTabNames, {
      [appRoute.url]: appRoute.tabName,
    });
  });
});

export type BagThema = `${Thema}_BAG`;

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
  Object.entries(Themas).map(([key, key2]) => {
    return [key, `${key2}_BAG`];
  })
);

// These are used for PageHeadings and link title props for example.
//YACINE deze eventueel vervangen door waar ThemaTitles dit te vervangen met {ThemaNieuw.BURGERZAKEN.title}
export const ThemaTitles: { [thema in Thema]: string } = {
  AFVAL: 'Afval',
  BELASTINGEN: 'Belastingen',
  BURGERZAKEN: 'Burgerzaken',
  BUURT: 'Mijn buurt',
  BEZWAREN: 'Bezwaren',
  INKOMEN: 'Inkomen',
  STADSPAS: 'Stadspas',
  BRP: 'Mijn gegevens',
  MILIEUZONE: 'Milieuzone',
  OVERTREDINGEN: 'Overtredingen voertuigen',
  NOTIFICATIONS: 'Actueel',
  ROOT: 'Home',
  ERFPACHT: 'Erfpacht',
  ERFPACHTv2: 'Erfpacht V2',
  SUBSIDIE: 'Subsidies',
  ZORG: 'Zorg en ondersteuning',
  VERGUNNINGEN: 'Vergunningen en ontheffingen',
  VERGUNNINGEN_LOPEND: 'Vergunningen',
  VERGUNNINGEN_EERDER: 'Vergunningen',
  KVK: 'Mijn onderneming',
  SIA: 'Meldingen',
  TOERISTISCHE_VERHUUR: 'Toeristische verhuur',
  KREFIA: 'Kredietbank & FIBU',
  SEARCH: 'Zoeken',
  PARKEREN: 'Parkeren',
  KLACHTEN: 'Klachten',
  HORECA: 'Horeca',
  AVG: 'AVG persoonsgegevens',
  BODEM: 'Bodem',
  SVWI: 'SVWI',
};

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

let themaMenuItems = [];
for (const [key, value] of Object.entries(ThemaNieuw)) {
  let url = value.appRoutes[0].url;
  // console.log(value);
  themaMenuItems.push({
    title: value.title,
    id: key,
    to: url, // the first in this list is always the thema url
    profileTypes: value.profileTypes,
  });

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
export const myThemasMenuItems: ThemaMenuItem[] = [
  {
    title: ThemaTitles.ERFPACHT,
    id: Themas.ERFPACHT,
    to: ExternalUrls.SSO_ERFPACHT || '',
    rel: 'external',
    profileTypes: ['private'],
  },
  {
    title: ThemaTitles.ERFPACHTv2,
    id: Themas.ERFPACHTv2,
    to: AppRoutes.ERFPACHTv2,
    profileTypes: ['private'],
  },
  {
    title: ThemaTitles.ERFPACHTv2,
    id: Themas.ERFPACHTv2,
    to: ExternalUrls.ERFPACHTv2_ZAKELIJK,
    profileTypes: ['commercial'],
    rel: 'external',
  },
  {
    title: ThemaTitles.ERFPACHT,
    id: Themas.ERFPACHT,
    to: ExternalUrls.EH_SSO_ERFPACHT || '',
    rel: 'external',
    profileTypes: ['commercial'],
  },
  {
    title: ThemaTitles.SUBSIDIE,
    id: Themas.SUBSIDIE,
    to: `${ExternalUrls.SSO_SUBSIDIE}?authMethod=digid`,
    rel: 'external',
    profileTypes: ['private'],
  },
  {
    title: ThemaTitles.SUBSIDIE,
    id: Themas.SUBSIDIE,
    to: `${ExternalUrls.SSO_SUBSIDIE}?authMethod=eherkenning`,
    rel: 'external',
    profileTypes: ['commercial'],
  },

  {
    title: ThemaTitles.SVWI,
    id: Themas.SVWI,
    to: ExternalUrls.SVWI,
    rel: 'external',
    profileTypes: ['private'],
  },
  {
    title: ThemaTitles.STADSPAS,
    id: Themas.STADSPAS,
    to: AppRoutes.STADSPAS,
    profileTypes: ['private'],
  },

  {
    title: ThemaTitles.VERGUNNINGEN,
    id: Themas.VERGUNNINGEN,
    to: AppRoutes.VERGUNNINGEN,
    profileTypes: ['private', 'commercial'],
  },

  {
    title: ThemaTitles.SIA,
    id: Themas.SIA,
    to: AppRoutes.SIA,
    profileTypes: ['private-attributes'],
  },

  ...themaMenuItems,
  // {
  //   title: ThemaTitles.AVG,
  //   id: Themas.AVG,
  //   to: generatePath(AppRoutes.AVG, { page: 1 }),
  //   profileTypes: ['private'],
  // },
  //
  // {
  //   title: ThemaTitles.BELASTINGEN,
  //   id: Themas.BELASTINGEN,
  //   to: ExternalUrls.SSO_BELASTINGEN,
  //   rel: 'external',
  //   profileTypes: ['private'],
  // },
  // {
  //   title: ThemaTitles.BELASTINGEN,
  //   id: Themas.BELASTINGEN,
  //   to: ExternalUrls.EH_SSO_BELASTINGEN,
  //   rel: 'external',
  //   profileTypes: ['commercial'],
  //   isAlwaysVisible: true,
  // },
  // {
  //   title: ThemaTitles.BEZWAREN,
  //   id: Themas.BEZWAREN,
  //   to: AppRoutes.BEZWAREN,
  //   profileTypes: ['private', 'commercial'],
  // },
  // ];  {
  //     title: ThemaTitles.AFVAL,
  //     id: Themas.AFVAL,
  //     to: AppRoutes.AFVAL,
  //     profileTypes: ['private', 'commercial'],
  //   }
  // {
  //   title: ThemaTitles.BODEM,
  //   id: Themas.BODEM,
  //   to: AppRoutes.BODEM,
  //   profileTypes: ['private', 'commercial'],
  // },
  // {
  //   title: ThemaTitles.BURGERZAKEN,
  //   id: Themas.BURGERZAKEN,
  //   to: AppRoutes.BURGERZAKEN,
  //   profileTypes: ['private'],

  //   title: ThemaTitles.INKOMEN,
  //   id: Themas.INKOMEN,
  //   to: AppRoutes.INKOMEN,
  //   profileTypes: ['private'],
  // },
  // {
  //   title: ThemaTitles.ZORG,
  //   id: Themas.ZORG,
  //   to: AppRoutes.ZORG,
  //   profileTypes: ['private'],
  // },
  // {
  //   title: ThemaTitles.KLACHTEN,
  //   id: Themas.KLACHTEN,
  //   to: generatePath(AppRoutes.KLACHTEN, { page: 1 }),
  //   profileTypes: ['private'],
  // },
  // {
  //   title: ThemaTitles.BRP,
  //   id: Themas.BRP,
  //   to: AppRoutes.BRP,
  //   profileTypes: ['private'],
  // },
  // {
  //   title: ThemaTitles.HORECA,
  //   id: Themas.HORECA,
  //   to: AppRoutes.HORECA,
  //   profileTypes: ['private', 'commercial'],
  // },
  // {
  //   title: ThemaTitles.TOERISTISCHE_VERHUUR,
  //   id: Themas.TOERISTISCHE_VERHUUR,
  //   to: AppRoutes.TOERISTISCHE_VERHUUR,
  //   profileTypes: ['private', 'commercial'],
  // },
  // {
  //   title: ThemaTitles.KREFIA,
  //   id: Themas.KREFIA,
  //   to: AppRoutes.KREFIA,
  //   profileTypes: ['private'],
  // },
  // {
  //   title: ThemaTitles.OVERTREDINGEN,
  //   id: Themas.OVERTREDINGEN,
  //   to: ExternalUrls.SSO_MILIEUZONE || '', // TODO: In de toekomst wordt dit een andere link
  //   rel: 'external',
  //   profileTypes: ['private', 'commercial'],
  // },
  // {
  //   title: ThemaTitles.MILIEUZONE,
  //   id: Themas.MILIEUZONE,
  //   to: ExternalUrls.SSO_MILIEUZONE || '',
  //   rel: 'external',
  //   profileTypes: ['private', 'commercial'],
  // },
  // {
  //   title: ThemaTitles.PARKEREN,
  //   id: Themas.PARKEREN,
  //   to: AppRoutes.PARKEREN,
  //   profileTypes: ['private', 'commercial'],
  //   hasAppStateValue: false,
  // },
  // {
  //   title: ThemaTitles.KVK,
  //   id: Themas.KVK,
  //   to: AppRoutes.KVK,
  //   profileTypes: ['commercial', 'private'],
  // },
];
