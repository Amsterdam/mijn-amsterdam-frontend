import { ExternalUrls } from './app';
import { IS_PRODUCTION } from './env';
import { generatePath } from 'react-router-dom';
import { Thema } from './thema';

export type inlogType = 'private' | 'commercial';

export type AppRouteInfo = {
  urlID?: string; //TODO ? weg strx
  url: string;
  tabName: string;
  // [key in AppRoute]: string | ((config: TrackingConfig) => string);
};

export type ThemaConfig = {
  title: string;
  // NOTE: If 1 THEMA has and PATRON A and PATRON C then these appRoutes are a list of first private / Digid (appRoutes[0]) then commercial/EHerk (appRoutes[1])
  appRoutes: AppRouteInfo[]; //path (url) AND whats in tehe TAB (tabName)
  isExternal: boolean; // YES or NO to (externe) site
  profileTypes: inlogType[]; //dinlogtypes (private = DIGID / commercial=EHERK or Both)
  isAlwaysVisible?: boolean;
  hasAppStateValue?: boolean;

  //icon: SVGComponent; // Add the themaIcon in '../../client/assets/icons' and import it.
  //isThemaActive: (state: AppState) => { return: true }; > zie app.ts
};

export const themaNieuw: Record<Thema, ThemaConfig> = {
  ROOT: {
    title: '',
    appRoutes: [{ url: '', tabName: 'Home | Dashboard' }],
    isExternal: false,
    profileTypes: ['private', 'commercial'],
    //   //icon: IconAVG,
    //   //isThemaActive: (state: AppState) => { return: true },
  },

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
        urlID: 'AVG',
        url: generatePath('/avg', { page: 1 }),
        tabName: ' AVG persoonsgegevens | verzoeken',
      },
      {
        urlID: 'AVG/DETAIL',
        url: '/avg/verzoek/:id',
        tabName: ' AVG persoonsgegevens | verzoek',
      },
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
      {
        urlID: 'BURGERZAKEN',
        url: '/burgerzaken',
        tabName: 'Burgerzaken | overzicht',
      },
      {
        urlID: 'BURGERZAKEN/ID-KAART',
        url: '/burgerzaken/id-kaart/:id',
        tabName: 'Burgerzaken | ID - kaart',
      },
      {
        urlID: 'BURGERZAKEN/PASPOORT',
        url: '/burgerzaken/paspoort/:id',
        tabName: 'Burgerzaken | Paspoort',
      },
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
        tabName: 'Erfpacht | Lijst met open facturen',
      },
      {
        url: '/erfpacht/facturen/:dossierNummerUrlParam/:page?',
        tabName: 'Erfpacht | Lijst met facturen',
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
    //hasAppStateValue: false, //?? NAAR KIJKEN
  },
  TOERISTISCHE_VERHUUR: {
    title: 'Toeristische verhuur',
    //browserTabName: '| overzicht',
    appRoutes: [
      {
        urlID: 'TOERISTISCHE_VERHUUR',
        url: '/toeristische-verhuur',
        tabName: 'Toeristische verhuur | overzicht!!!',
      },
      {
        urlID: 'TOERISTISCHE_VERHUUR/VERGUNNING',
        url: '/toeristische-verhuur/vergunning/:id',
        tabName: `Vergunning | Toeristische verhuur`,
      },
      {
        urlID: 'TOERISTISCHE_VERHUUR/VERGUNNING/BB',
        url: '/toeristische-verhuur/vergunning/bed-and-breakfast/:id',
        tabName: 'Vergunning Bed & Breakfast | Toeristische verhuur',
      },
      {
        urlID: 'TOERISTISCHE_VERHUUR/VERGUNNING/VV',
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
