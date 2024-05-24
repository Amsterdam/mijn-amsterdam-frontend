import { generatePath } from 'react-router-dom';
import { LinkProps } from '../types/App.types';
import { ExternalUrls } from './app';
import { AppRoute, AppRoutes, TrackingConfig } from './routes';
// import { AppState } from '../../client/AppState';
// import { SVGComponent } from '../types';
// import { IconAVG, IconBezwaren } from '../../client/assets/icons';

//nieuw toegevoegd
//import { SVGComponent } from '../../universal/types';
//import { IconAVG, IconBezwaren } from '../../client/assets/icons';

// Within the team we call these Themes / Thema's
export type Thema =
  | 'AFVAL'
  | 'BELASTINGEN'
  | 'BURGERZAKEN'
  | 'BUURT'
  | 'BEZWAREN'
  | 'INKOMEN'
  | 'STADSPAS'
  | 'BRP'
  | 'MILIEUZONE'
  | 'OVERTREDINGEN'
  | 'NOTIFICATIONS'
  | 'ROOT'
  | 'ERFPACHT'
  | 'ERFPACHTv2'
  | 'ZORG'
  | 'VERGUNNINGEN'
  | 'SVWI'
  | 'KVK'
  | 'SIA'
  | 'TOERISTISCHE_VERHUUR'
  | 'SEARCH'
  | 'SUBSIDIE'
  | 'PARKEREN'
  | 'KLACHTEN'
  | 'HORECA'
  | 'KREFIA'
  | 'AVG'
  | 'BODEM'
  | string;

export type ThemaIDs = 'BEZWAREN' | 'AVG';
export type inlogType = 'private' | 'commercial';

// export enum nums {
//   BEZWAREN = 'BEZWAREN',
//   AVG = 'AVG',
// }
type ThemaConfig = {
  title: string;
  browserTabName: string; //dit zie je in je browser wanneer je op thema pagina komt
  browserTabNameDetail: string; //dit zie je in je browser wanneer je op detail pagina komt
  appRoute: string; //dit is wat je ziet in de url ziet nadat je op thema klikt (klopt)
  appRouteDetail: string; //dit is wat je ziet in de url ziet wanneer je op een detailpagina bent
  profileTypes: inlogType[]; //dit zijn de inlogtypes (DIGID/EHERK of BEIDE)
  // icon: SVGComponent; // Add the themaIcon in '../../client/assets/icons' and import it.
  //isThemaActive: (state: AppState) => { return: true };
};

export const themas2: Record<ThemaIDs, ThemaConfig> = {
  BEZWAREN: {
    title: 'Bezwaren3',
    browserTabName: '| overzicht',
    browserTabNameDetail: '| bezwaar',
    appRoute: '/bezwaren',
    appRouteDetail: '/bezwaren/:uuid',
    profileTypes: ['private', 'commercial'],
    // icon: IconBezwaren,
    //isThemaActive: (state: AppState) => { return: true }
  },
  AVG: {
    title: 'AVG persoonsgegevens',
    browserTabName: '| verzoeken',
    browserTabNameDetail: '| verzoek',
    appRoute: generatePath(AppRoutes.AVG, { page: 1 }),
    appRouteDetail: '/avg/verzoek/:id',
    profileTypes: ['private'],
    // icon: IconAVG,
    //isThemaActive: (state: AppState) => { return: true },
  },
};

console.log('HALLLOOO ', themas2);

let browserTabNames = {};
// https://sentry.io/answers/how-can-i-add-a-key-value-pair-to-a-javascript-object/

//omdat je object niet mag itereren > maak je er
Object.values(themas2).forEach((value, index) => {
  // consol¿e.log(value);
  Object.assign(browserTabNames, {
    [value.appRoute]: `${value.title}  ${[value.browserTabName]}`,
  });
  Object.assign(browserTabNames, {
    [value.appRouteDetail]: `${value.title}  ${[value.browserTabNameDetail]}`,
  });
});
console.log('browserTabNames', browserTabNames);

// for (const key in themas2) {
//   console.log('HALLLOOO ', themas2.);
// }

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
  [AppRoutes.BURGERZAKEN]: `${ThemaTitles.BURGERZAKEN} | overzicht`,
  [AppRoutes['BURGERZAKEN/ID-KAART']]: `ID-Kaart | ${ThemaTitles.BURGERZAKEN}`,
  [AppRoutes.ZORG]: `${ThemaTitles.ZORG} | overzicht`,
  [AppRoutes['ZORG/VOORZIENINGEN']]: `Voorziening | ${ThemaTitles.ZORG}`,
  [AppRoutes.INKOMEN]: `${ThemaTitles.INKOMEN} | overzicht`,
  [AppRoutes['INKOMEN/BIJSTANDSUITKERING']]:
    `Bijstandsuitkering | ${ThemaTitles.INKOMEN}`,
  [AppRoutes.STADSPAS]: `Stadspas | overzicht`,
  [AppRoutes['STADSPAS/AANVRAAG']]: `Stadspas | ${ThemaTitles.INKOMEN}`,
  [AppRoutes['STADSPAS/SALDO']]: `Stadspas saldo | ${ThemaTitles.INKOMEN}`,
  [AppRoutes['INKOMEN/TOZO']]: `Tozo | ${ThemaTitles.INKOMEN}`,
  [AppRoutes['INKOMEN/TONK']]: `TONK | ${ThemaTitles.INKOMEN}`,
  [AppRoutes['INKOMEN/BBZ']]: `Bbz | ${ThemaTitles.INKOMEN}`,
  [AppRoutes['INKOMEN/SPECIFICATIES']]:
    `Uitkeringsspecificaties | ${ThemaTitles.INKOMEN}`,
  [`${AppRoutes['INKOMEN/SPECIFICATIES']}/jaaropgaven`]: `Jaaropgaven | ${ThemaTitles.INKOMEN}`,
  [AppRoutes.BRP]: `Mijn gegevens`,
  [AppRoutes.ACCESSIBILITY]: `Toegankelijkheidsverklaring`,
  [AppRoutes.GENERAL_INFO]: `Dit ziet u in Mijn Amsterdam`,
  [AppRoutes.VERGUNNINGEN]: `${ThemaTitles.VERGUNNINGEN} | overzicht`,
  [AppRoutes['VERGUNNINGEN/DETAIL']]:
    `Vergunning | ${ThemaTitles.VERGUNNINGEN}`,
  [AppRoutes.KVK]: `Mijn onderneming`,
  [AppRoutes.BUURT]: `Mijn buurt`,
  [AppRoutes.NOTIFICATIONS]: `${ThemaTitles.NOTIFICATIONS} | overzicht`,
  [AppRoutes.AFVAL]: `${ThemaTitles.AFVAL} rond uw adres`,
  [AppRoutes.SIA]: `${ThemaTitles.SIA} overzicht`,
  [AppRoutes['SIA/DETAIL/OPEN']]: `Melding open | ${ThemaTitles.SIA}`,
  [AppRoutes['SIA/DETAIL/CLOSED']]: `Melding afgesloten | ${ThemaTitles.SIA}`,
  [AppRoutes.SIA_OPEN]: `Meldingen | Alle openstaande meldingen`,
  [AppRoutes.SIA_CLOSED]: `Meldingen | Alle afgesloten meldingen`,
  [AppRoutes.TOERISTISCHE_VERHUUR]: `${ThemaTitles.TOERISTISCHE_VERHUUR} | overzicht`,
  [AppRoutes['TOERISTISCHE_VERHUUR/VERGUNNING']]:
    `Vergunning | ${ThemaTitles.TOERISTISCHE_VERHUUR}`,
  [AppRoutes['TOERISTISCHE_VERHUUR/VERGUNNING/BB']]:
    `Vergunning Bed & Breakfast | ${ThemaTitles.TOERISTISCHE_VERHUUR}`,
  [AppRoutes['TOERISTISCHE_VERHUUR/VERGUNNING/VV']]:
    `Vergunning vakantieverhuur | ${ThemaTitles.TOERISTISCHE_VERHUUR}`,
  [AppRoutes.KREFIA]: `${ThemaTitles.KREFIA}`,
  [AppRoutes.SEARCH]: `Zoeken`,
  [AppRoutes.PARKEREN]: 'Parkeren',
  [AppRoutes.KLACHTEN]: `${ThemaTitles.KLACHTEN} | overzicht`,
  [AppRoutes['KLACHTEN/KLACHT']]: `${ThemaTitles.KLACHTEN} | klacht`,
  [AppRoutes.HORECA]: 'Horeca | overzicht',
  [AppRoutes['HORECA/DETAIL']]: 'Vergunning | Horeca',
  [AppRoutes.YIVI_LANDING]: 'Inloggen met yivi | Mijn Amsterdam',
  [AppRoutes.BFF_500_ERROR]: '500 Server Error | Mijn Amsterdam',
  [AppRoutes.BODEM]: 'Bodem | overzicht',
  [AppRoutes['BODEM/LOOD_METING']]: 'Bodem | lood in de bodem-check',
  [AppRoutes.ERFPACHTv2]: 'Erfpacht | overzicht',
  [AppRoutes['ERFPACHTv2/DOSSIERS']]: 'Erfpacht | Lijst met dossiers',
  [AppRoutes['ERFPACHTv2/OPEN_FACTUREN']]: 'Erfpacht | Lijst met open facturen',
  [AppRoutes['ERFPACHTv2/ALLE_FACTUREN']]: 'Erfpacht | Lijst met facturen',
  [AppRoutes['ERFPACHTv2/DOSSIERDETAIL']]: 'Erfpacht | dossier',
  [AppRoutes.API_LOGIN]: 'Inloggen | Mijn Amsterdam',
  [AppRoutes.API1_LOGIN]: 'Inloggen | Mijn Amsterdam',
  [AppRoutes.API2_LOGIN]: 'Inloggen | Mijn Amsterdam',
  ...browserTabNames,
  // [AppRoutes.BEZWAREN]: `${ThemaTitles.BEZWAREN} | overzicht`,
  // [AppRoutes['BEZWAREN/DETAIL']]: `${ThemaTitles.BEZWAREN} | bezwaar`,
  // [AppRoutes.AVG]: `${ThemaTitles.AVG} | verzoeken`,
  // [AppRoutes['AVG/DETAIL']]: `${ThemaTitles.AVG} | verzoek`,
};

export interface ThemaMenuItem extends LinkProps {
  id: Thema;
  profileTypes: ProfileType[];
  isAlwaysVisible?: boolean;
  hasAppStateValue?: boolean;
}

let themaMenuItems = [];

for (const [key, value] of Object.entries(themas2)) {
  // consol¿e.log(value);
  themaMenuItems.push({
    title: value.title,
    id: key,
    to: value.appRoute,
    profileTypes: value.profileTypes,
  });
}

export const myThemasMenuItems: ThemaMenuItem[] = [
  {
    title: ThemaTitles.BRP,
    id: Themas.BRP,
    to: AppRoutes.BRP,
    profileTypes: ['private'],
  },
  {
    title: ThemaTitles.KVK,
    id: Themas.KVK,
    to: AppRoutes.KVK,
    profileTypes: ['commercial', 'private'],
  },
  {
    title: ThemaTitles.BELASTINGEN,
    id: Themas.BELASTINGEN,
    to: ExternalUrls.SSO_BELASTINGEN,
    rel: 'external',
    profileTypes: ['private'],
  },

  {
    title: ThemaTitles.BELASTINGEN,
    id: Themas.BELASTINGEN,
    to: ExternalUrls.EH_SSO_BELASTINGEN,
    rel: 'external',
    profileTypes: ['commercial'],
    isAlwaysVisible: true,
  },
  {
    title: ThemaTitles.BURGERZAKEN,
    id: Themas.BURGERZAKEN,
    to: AppRoutes.BURGERZAKEN,
    profileTypes: ['private'],
  },
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
    title: ThemaTitles.ZORG,
    id: Themas.ZORG,
    to: AppRoutes.ZORG,
    profileTypes: ['private'],
  },
  {
    title: ThemaTitles.INKOMEN,
    id: Themas.INKOMEN,
    to: AppRoutes.INKOMEN,
    profileTypes: ['private'],
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
    title: ThemaTitles.AFVAL,
    id: Themas.AFVAL,
    to: AppRoutes.AFVAL,
    profileTypes: ['private', 'commercial'],
  },
  {
    title: ThemaTitles.VERGUNNINGEN,
    id: Themas.VERGUNNINGEN,
    to: AppRoutes.VERGUNNINGEN,
    profileTypes: ['private', 'commercial'],
  },
  {
    title: ThemaTitles.MILIEUZONE,
    id: Themas.MILIEUZONE,
    to: ExternalUrls.SSO_MILIEUZONE || '',
    rel: 'external',
    profileTypes: ['private', 'commercial'],
  },
  {
    title: ThemaTitles.OVERTREDINGEN,
    id: Themas.OVERTREDINGEN,
    to: ExternalUrls.SSO_MILIEUZONE || '', // TODO: In de toekomst wordt dit een andere link
    rel: 'external',
    profileTypes: ['private', 'commercial'],
  },
  {
    title: ThemaTitles.SIA,
    id: Themas.SIA,
    to: AppRoutes.SIA,
    profileTypes: ['private-attributes'],
  },
  {
    title: ThemaTitles.TOERISTISCHE_VERHUUR,
    id: Themas.TOERISTISCHE_VERHUUR,
    to: AppRoutes.TOERISTISCHE_VERHUUR,
    profileTypes: ['private', 'commercial'],
  },
  {
    title: ThemaTitles.KREFIA,
    id: Themas.KREFIA,
    to: AppRoutes.KREFIA,
    profileTypes: ['private'],
  },
  {
    title: ThemaTitles.PARKEREN,
    id: Themas.PARKEREN,
    to: AppRoutes.PARKEREN,
    profileTypes: ['private', 'commercial'],
    hasAppStateValue: false,
  },
  {
    title: ThemaTitles.KLACHTEN,
    id: Themas.KLACHTEN,
    to: generatePath(AppRoutes.KLACHTEN, { page: 1 }),
    profileTypes: ['private'],
  },
  {
    title: ThemaTitles.HORECA,
    id: Themas.HORECA,
    to: AppRoutes.HORECA,
    profileTypes: ['private', 'commercial'],
  },
  {
    title: ThemaTitles.BODEM,
    id: Themas.BODEM,
    to: AppRoutes.BODEM,
    profileTypes: ['private', 'commercial'],
  },
  ...themaMenuItems,
  // {
  //   title: ThemaTitles.AVG,
  //   id: Themas.AVG,
  //   to: generatePath(AppRoutes.AVG, { page: 1 }),
  //   profileTypes: ['private'],
  // },
  // {
  //   title: themas2.BEZWAREN.title,
  //   id: nums.BEZWAREN,
  //   to: themas2.BEZWAREN.appRoute,
  //   profileTypes: ['private', 'commercial'],
  // },
  // {
  //   title: ThemaTitles.BEZWAREN,
  //   id: Themas.BEZWAREN,
  //   to: AppRoutes.BEZWAREN,
  //   profileTypes: ['private', 'commercial'],
  // },
];
