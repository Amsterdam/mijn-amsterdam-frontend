import { ExternalUrls } from './app';
import { IS_PRODUCTION } from './env';
import { generatePath } from 'react-router-dom';
import { Thema, ThemaTitles } from './thema';

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
  NOTIFICATIONS: {
    //IS DIT WEL EEN THEMA? NIET UITGEZET IN ROUTES.TS
    title: 'Actueel',
    appRoutes: [
      {
        urlID: 'NOTIFICATIONS',
        url: '/overzicht-updates/:page?',
        tabName: 'Actueel | Overzicht',
      },
    ],
    isExternal: false,
    profileTypes: ['private', 'commercial'],
    //   //icon:  IconMyNotifications,
  },

  SEARCH: {
    //IS DIT WEL EEN THEMA?NIET UITGEZET IN ROUTES.TS
    title: 'Zoeken',
    appRoutes: [
      { urlID: 'SEARCH', url: '/zoeken', tabName: 'Home | Dashboard' },
    ],
    isExternal: false,
    profileTypes: ['private', 'commercial'],
    //icon: IconSearch,
  },
  AFIS: {
    title: 'Facturen en betalen',
    appRoutes: [
      {
        urlID: 'AFIS',
        url: '/afis',
        tabName: 'Facturen en betalen | overzicht',
      },
    ],
    isExternal: false,
    profileTypes: ['private', 'commercial'],
  },
  BRP: {
    title: 'Mijn gegevens',
    appRoutes: [
      {
        urlID: 'BRP',
        url: '/persoonlijke-gegevens',
        tabName: `Mijn gegevens`,
      },
    ],
    isExternal: false,
    profileTypes: ['private'],
    //   //icon: IconMijnGegevens,
    //   //isThemaActive: (state: AppState) => { return: true }
  },

  AFVAL: {
    title: 'Afval',
    appRoutes: [
      { urlID: 'AFVAL', url: '/afval', tabName: 'Afval rond uw adres' },
    ],
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
        tabName: 'AVG persoonsgegevens | verzoeken',
      },
      {
        urlID: 'AVG/DETAIL',
        url: '/avg/verzoek/:id',
        tabName: 'AVG persoonsgegevens | verzoek',
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
      { urlID: 'BEZWAREN', url: '/bezwaren', tabName: 'Bezwaren | overzicht' },
      {
        urlID: 'BEZWAREN/DETAIL',
        url: '/bezwaren/:uuid',
        tabName: 'Bezwaren | bezwaar',
      },
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
      { urlID: 'BODEM', url: '/bodem', tabName: 'Bodem | overzicht' },
      {
        urlID: 'BODEM/LOOD_METING',
        url: '/lood-meting/:id',
        tabName: 'Bodem | lood in de bodem-check',
      },
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
    appRoutes: [{ urlID: 'BUURT', url: '/buurt', tabName: 'Mijn Buurt' }],
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
      {
        urlID: 'ERFPACHTv2',
        url: '/erfpacht',
        tabName: 'Erfpacht | overzicht',
      },
      {
        url: `https://erfpachtzakelijk${!IS_PRODUCTION ? '-ont' : ''}.amsterdam.nl`,
        tabName: '',
      },
      {
        urlID: 'ERFPACHTv2/DOSSIERS',
        url: '/erfpacht/dossiers/:page?',
        tabName: 'Erfpacht | Lijst met dossiers',
      },
      {
        urlID: 'ERFPACHTv2/DOSSIERDETAIL',
        url: '/erfpacht/dossier/:dossierNummerUrlParam',
        tabName: 'Erfpacht | dossier',
      },
      {
        urlID: 'ERFPACHTv2/OPEN_FACTUREN',
        url: '/erfpacht/open-facturen/:page?',
        tabName: 'Erfpacht | Lijst met open facturen',
      },
      {
        urlID: 'ERFPACHTv2/ALLE_FACTUREN',
        url: '/erfpacht/facturen/:dossierNummerUrlParam/:page?',
        tabName: 'Erfpacht | Lijst met facturen',
      },
    ],
    isExternal: false,
    profileTypes: ['private', 'commercial'],
    //   //icon:IIconErfpacht,
    //isThemaActive: (state: AppState) => { return: true }
  },

  HLI: {
    title: '',
    appRoutes: [
      { urlID: 'HLI', url: '/regelingen-bij-laag-inkomen', tabName: '' },
      {
        urlID: 'HLI/STADSPAS',
        url: '/regelingen-bij-laag-inkomen/stadspas/:id',
        tabName: '',
      },
      {
        urlID: 'HLI/REGELING',
        url: '/regelingen-bij-laag-inkomen/regeling/:regeling/:id',
        tabName: '',
      },
      {
        urlID: 'HLI/REGELINGEN_LIJST',
        url: '/regelingen-bij-laag-inkomen/eerdere-en-afgewezen-regelingen/:page?',
        tabName: '',
      },
    ],

    isExternal: false,
    profileTypes: ['private'],
  },

  HORECA: {
    title: 'Horeca',
    appRoutes: [
      { urlID: 'HORECA', url: '/horeca/', tabName: 'Horeca | overzicht' },
      {
        urlID: 'HORECA/DETAIL',
        url: '/horeca/:title/:id',
        tabName: 'Vergunning | Horeca',
      },
    ],
    isExternal: false,
    profileTypes: ['private', 'commercial'],
    //   //icon: IconHoreca,
    //   //isThemaActive: (state: AppState) => { return: true }
  },
  INKOMEN: {
    title: 'Inkomen',
    appRoutes: [
      { urlID: 'INKOMEN', url: '/inkomen', tabName: 'Inkomen | overzicht' },
      {
        urlID: 'INKOMEN/BIJSTANDSUITKERING',
        url: '/inkomen/bijstandsuitkering/:id',
        tabName: 'Bijstandsuitkering | Inkomen',
      },
      {
        urlID: 'INKOMEN/TOZO',
        url: '/inkomen/tozo/:version/:id',
        tabName: 'Tozo | Inkomen',
      },
      {
        urlID: 'INKOMEN/TONK',
        url: '/inkomen/tonk/:version/:id',
        tabName: 'TONK | Inkomen',
      },
      {
        urlID: 'INKOMEN/BBZ',
        url: '/inkomen/bbz/:version/:id',
        tabName: 'Bbz |Inkomen',
      },
      {
        urlID: 'INKOMEN/SPECIFICATIES',
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
      {
        urlID: 'KLACHTEN',
        url: '/klachten/:page?',
        tabName: 'Klachten | overzicht',
      },
      {
        urlID: 'KLACHTEN/KLACHT',
        url: '/klachten/klacht/:id',
        tabName: 'Klachten | klacht',
      },
    ],
    isExternal: false,
    profileTypes: ['private'],
    //   //icon: IconKlachten,
    //   //isThemaActive: (state: AppState) => { return: true }
  },

  KVK: {
    title: 'Mijn onderneming',
    appRoutes: [
      {
        urlID: 'KVK',
        url: '/gegevens-handelsregister',
        tabName: `Mijn onderneming`,
      },
    ],
    isExternal: false,
    profileTypes: ['private', 'commercial'],
    //   //icon: IconHomeCommercial,
    //   //isThemaActive: (state: AppState) => { return: true }
  },

  KREFIA: {
    title: 'Kredietbank & FIBU',
    appRoutes: [
      {
        urlID: 'KREFIA',
        url: '/kredietbank-fibu',
        tabName: 'Kredietbank & FIBU',
      },
    ],
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
    appRoutes: [{ urlID: 'PARKEREN', url: '/parkeren', tabName: 'Parkeren' }],
    isExternal: false,
    profileTypes: ['private', 'commercial'],
    //icon: IconParkeren,
    //isThemaActive: (state: AppState) => { return: true },
    //hasAppStateValue: false, //?? NAAR KIJKEN
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
    appRoutes: [
      { urlID: 'STADSPAS', url: '/stadspas', tabName: 'Stadspas | Overzicht' },
      {
        urlID: 'STADSPAS/AANVRAAG',
        url: '/stadspas/aanvraag/:id',
        tabName: `Stadspas | Inkomen`, // tonen we wel stadspasaanvragen?
      },
      {
        urlID: 'STADSPAS/SALDO',
        url: '/stadspas/saldo-en-transacties/:id',
        tabName: `Stadspas | Saldo`,
      }, //staat deze wel goed hier, of moet ie bij Inkomen?
    ],
    isExternal: false,
    profileTypes: ['private'],
    //icon:IconStadspas,
    //isThemaActive: (state: AppState) => { return: true }
  },

  SVWI: {
    title: 'SVWI',
    appRoutes: [
      {
        urlID: 'SWVI',
        url: `https://mijn.werkeninkomen${
          !IS_PRODUCTION ? '-acc' : ''
        }.amsterdam.nl/`,
        tabName: '',
      },
    ],
    isExternal: true,
    profileTypes: ['private'],
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

  VERGUNNINGEN: {
    title: 'Vergunningen en ontheffingen',
    appRoutes: [
      {
        urlID: 'VERGUNNINGEN',
        url: '/vergunningen',
        tabName: 'Vergunningen en ontheffingen | Overzicht',
      },
      {
        urlID: 'VERGUNNINGEN/DETAIL',
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
        urlID: 'ZORG',
        url: '/zorg-en-ondersteuning',
        tabName: 'Zorg en ondersteuning | overzicht',
      },
      {
        urlID: 'ZORG/VOORZIENINGEN',
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
