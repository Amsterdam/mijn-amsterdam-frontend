import { generatePath } from 'react-router-dom';

import { TrackingConfig } from './routes';
import { AppRoute, AppRoutes } from '../../universal/config/routes';
import { Thema, Themas } from '../../universal/config/thema';
import { AppState, BagThema, LinkProps } from '../../universal/types/App.types';
import { getAfisListPageDocumentTitle } from '../pages/Afis/Afis-thema-config';
import { getAVGListPageDocumentTitle } from '../pages/AVG/AVG-thema-config';
import { getBezwarenListPageDocumentTitle } from '../pages/Bezwaren/Bezwaren-thema-config';
import {
  getThemaTitleBurgerzakenWithAppState,
  getThemaUrlBurgerzakenWithAppState,
} from '../pages/Burgerzaken/helpers';
import { getThemaTitleWithAppState } from '../pages/HLI/helpers';
import {
  getInkomenListPageDocumentTitle,
  getInkomenSpecificatiesListPageDocumentTitle,
} from '../pages/Inkomen/Inkomen-thema-config';
import {
  getVarenDetailPageDocumentTitle,
  getVarenListPageDocumentTitle,
} from '../pages/Varen/Varen-thema-config';
import { getListPageDocumentTitle } from '../pages/Vergunningen/Vergunningen-thema-config';

export const BagThemas: Record<Thema, BagThema> = Object.fromEntries(
  Object.entries(Themas).map(([key, key2]) => {
    return [key, `${key2}_BAG`];
  })
);

// These are used for PageHeadings and link title props for example.
export const ThemaTitles: { [thema in Thema]: string } = {
  AFIS: 'Facturen en betalen',
  AFVAL: 'Afval',
  AVG: 'AVG persoonsgegevens',
  BELASTINGEN: 'Belastingen',
  BEZWAREN: 'Bezwaren',
  BODEM: 'Bodem',
  BRP: 'Mijn gegevens',
  BURGERZAKEN: 'Paspoort en ID-kaart',
  BUURT: 'Mijn buurt',
  ERFPACHT: 'Erfpacht',
  ERFPACHTv2: `Erfpacht`,
  HLI: 'Stadspas en regelingen bij laag inkomen',
  HORECA: 'Horeca',
  INKOMEN: 'Inkomen',
  KLACHTEN: 'Klachten',
  KREFIA: 'Kredietbank & FIBU',
  KVK: 'Mijn onderneming',
  MILIEUZONE: 'Milieuzone',
  NOTIFICATIONS: 'Actueel',
  OVERTREDINGEN: 'Overtredingen voertuigen',
  PARKEREN: 'Parkeren',
  HOME: 'Home',
  SEARCH: 'Zoeken',
  SUBSIDIE: 'Subsidies',
  SVWI: 'SVWI',
  TOERISTISCHE_VERHUUR: 'Toeristische verhuur',
  VAREN: 'Passagiers- en beroepsvaart',
  VERGUNNINGEN: 'Vergunningen en ontheffingen',
  ZORG: 'Zorg en ondersteuning',
};

export const NOT_FOUND_TITLE = 'Pagina niet gevonden';
export const DocumentTitleMain = 'Mijn Amsterdam';
export const PageTitleMain = 'Mijn Amsterdam';
export type DocumentTitlesConfig = {
  [key in AppRoute]:
    | string
    | (<T extends Record<string, string>>(
        config: TrackingConfig,
        params: T | null
      ) => string);
};

// Used in <html><head><title>{PageTitle}</title></head>
export const DocumentTitles: DocumentTitlesConfig = {
  // Afis
  [AppRoutes.AFIS]: `${ThemaTitles.AFIS} | overzicht`,
  [AppRoutes['AFIS/FACTUREN']]: getAfisListPageDocumentTitle(ThemaTitles.AFIS),
  [AppRoutes['AFIS/BETAALVOORKEUREN']]:
    `Betaalvoorkeuren | ${ThemaTitles.AFIS}`,
  // Contactmomenten
  [AppRoutes['KLANT_CONTACT/CONTACTMOMENTEN']]:
    `Alle contactmomenten | ${ThemaTitles.BRP}`,

  // Burgerzaken
  [AppRoutes.BURGERZAKEN]: `${ThemaTitles.BURGERZAKEN} | overzicht`,
  [AppRoutes['BURGERZAKEN/LIST']]:
    `Paspoort en ID-kaart | ${ThemaTitles.BURGERZAKEN}`,
  [AppRoutes['BURGERZAKEN/IDENTITEITSBEWIJS']]: (_config, params) =>
    `${params?.documentType === 'paspoort' ? 'Paspoort' : 'ID-kaart'} | ${ThemaTitles.BURGERZAKEN}`,

  // Zorg
  [AppRoutes.ZORG]: `${ThemaTitles.ZORG} | overzicht`,
  [AppRoutes['ZORG/VOORZIENING']]: `Voorziening | ${ThemaTitles.ZORG}`,
  [AppRoutes['ZORG/VOORZIENINGEN_LIST']]: `Voorzieningen | ${ThemaTitles.ZORG}`,

  // Inkomen
  [AppRoutes.INKOMEN]: `${ThemaTitles.INKOMEN} | overzicht`,
  [AppRoutes['INKOMEN/SPECIFICATIES']]:
    getInkomenSpecificatiesListPageDocumentTitle(ThemaTitles.INKOMEN),
  [AppRoutes['INKOMEN/LIST']]: getInkomenListPageDocumentTitle(
    ThemaTitles.INKOMEN
  ),
  [AppRoutes['INKOMEN/BIJSTANDSUITKERING']]:
    `Bijstandsuitkering | ${ThemaTitles.INKOMEN}`,
  [AppRoutes['INKOMEN/TOZO']]: `Tozo | ${ThemaTitles.INKOMEN}`,
  [AppRoutes['INKOMEN/TONK']]: `TONK | ${ThemaTitles.INKOMEN}`,
  [AppRoutes['INKOMEN/BBZ']]: `Bbz | ${ThemaTitles.INKOMEN}`,

  // HLI
  [AppRoutes.HLI]: `Regelingen bij laag inkomen | overzicht`,
  [AppRoutes['HLI/STADSPAS']]: `Stadspas | ${ThemaTitles.HLI}`,
  [AppRoutes['HLI/REGELING']]: `Regeling | ${ThemaTitles.HLI}`,
  [AppRoutes['HLI/REGELINGEN_LIST']]: `Regelingen | ${ThemaTitles.HLI}`,

  // Vergunningen
  [AppRoutes.VERGUNNINGEN]: `${ThemaTitles.VERGUNNINGEN} | overzicht`,
  [AppRoutes['VERGUNNINGEN/LIST']]:
    `Vergunningen | ${ThemaTitles.VERGUNNINGEN}`,
  [AppRoutes['VERGUNNINGEN/DETAIL']]:
    `Vergunning | ${ThemaTitles.VERGUNNINGEN}`,

  // Mijn gegevens
  [AppRoutes.BRP]: `Mijn gegevens`,
  [AppRoutes.KVK]: `Mijn onderneming`,

  // Bezwaren
  [AppRoutes.BEZWAREN]: `${ThemaTitles.BEZWAREN} | overzicht`,
  [AppRoutes['BEZWAREN/LIST']]: getBezwarenListPageDocumentTitle(
    ThemaTitles.BEZWAREN
  ),
  [AppRoutes['BEZWAREN/DETAIL']]: `${ThemaTitles.BEZWAREN} | bezwaar`,

  // Toeristische verhuur
  [AppRoutes.TOERISTISCHE_VERHUUR]: `${ThemaTitles.TOERISTISCHE_VERHUUR} | overzicht`,
  [AppRoutes['TOERISTISCHE_VERHUUR/VERGUNNING']]:
    `Vergunning | ${ThemaTitles.TOERISTISCHE_VERHUUR}`,
  [AppRoutes['TOERISTISCHE_VERHUUR/VERGUNNING/LIST']]: getListPageDocumentTitle(
    ThemaTitles.TOERISTISCHE_VERHUUR
  ),

  // Varen
  [AppRoutes.VAREN]: `${ThemaTitles.VAREN} | overzicht`,
  [AppRoutes['VAREN/LIST']]: getVarenListPageDocumentTitle(ThemaTitles.VAREN),
  [AppRoutes['VAREN/DETAIL']]: getVarenDetailPageDocumentTitle(
    ThemaTitles.VAREN
  ),

  // Krefia
  [AppRoutes.KREFIA]: `${ThemaTitles.KREFIA}`,

  // Parkeren
  [AppRoutes.PARKEREN]: `${ThemaTitles.PARKEREN} | overzicht`,
  [AppRoutes['PARKEREN/DETAIL']]: `Parkeervergunning | ${ThemaTitles.PARKEREN}`,
  [AppRoutes['PARKEREN/LIST']]: getListPageDocumentTitle(ThemaTitles.PARKEREN),

  // Klachten
  [AppRoutes.KLACHTEN]: `${ThemaTitles.KLACHTEN} | overzicht`,
  [AppRoutes['KLACHTEN/LIST']]: `Klachten | ${ThemaTitles.KLACHTEN}`,
  [AppRoutes['KLACHTEN/KLACHT']]: `${ThemaTitles.KLACHTEN} | klacht`,

  // Horeca
  [AppRoutes.HORECA]: 'Horeca | overzicht',
  [AppRoutes['HORECA/LIST']]: getListPageDocumentTitle(ThemaTitles.HORECA),
  [AppRoutes['HORECA/DETAIL']]: 'Vergunning | Horeca',

  // AVG
  [AppRoutes.AVG]: `${ThemaTitles.AVG} | verzoeken`,
  [AppRoutes['AVG/LIST']]: getAVGListPageDocumentTitle(ThemaTitles.AVG),
  [AppRoutes['AVG/DETAIL']]: `AVG verzoek | ${ThemaTitles.AVG}`,

  // Bodem
  [AppRoutes.BODEM]: `${ThemaTitles.BODEM} | overzicht`,
  [AppRoutes['BODEM/LIST']]: `Lood in de bodem-checks | ${ThemaTitles.BODEM}`,
  [AppRoutes['BODEM/LOOD_METING']]:
    `Lood in de bodem-check | ${ThemaTitles.BODEM}`,

  // Erfpacht
  [AppRoutes.ERFPACHTv2]: 'Erfpacht | overzicht',
  [AppRoutes['ERFPACHTv2/DOSSIERS']]: 'Erfpacht | Lijst met dossiers',
  [AppRoutes['ERFPACHTv2/OPEN_FACTUREN']]: 'Erfpacht | Lijst met open facturen',
  [AppRoutes['ERFPACHTv2/ALLE_FACTUREN']]: 'Erfpacht | Lijst met facturen',
  [AppRoutes['ERFPACHTv2/DOSSIERDETAIL']]: 'Erfpacht | dossier',

  // Generic
  [AppRoutes.SEARCH]: `Zoeken`,
  [AppRoutes.BUURT]: `Mijn buurt`,
  [AppRoutes.NOTIFICATIONS]: `${ThemaTitles.NOTIFICATIONS} | overzicht`,
  [AppRoutes.AFVAL]: `${ThemaTitles.AFVAL} rond uw adres`,
  [AppRoutes.BFF_500_ERROR]: '500 Server Error | Mijn Amsterdam',
  [AppRoutes.API_LOGIN]: 'Inloggen | Mijn Amsterdam',
  [AppRoutes.API1_LOGIN]: 'Inloggen | Mijn Amsterdam',
  [AppRoutes.API2_LOGIN]: 'Inloggen | Mijn Amsterdam',
  [AppRoutes.ZAAK_STATUS]: 'Status van uw Zaak | Mijn Amsterdam',
  [AppRoutes.ACCESSIBILITY]: `Toegankelijkheidsverklaring`,
  [AppRoutes.GENERAL_INFO]: `Dit ziet u in Mijn Amsterdam`,

  [AppRoutes.HOME]: (config) => {
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
};

export interface ThemaMenuItem extends Omit<LinkProps, 'title' | 'to'> {
  id: Thema;
  profileTypes: ProfileType[];
  isAlwaysVisible?: boolean;
  hasAppStateValue?: boolean;
  title: LinkProps['title'] | ((appState: AppState) => string);
  to: LinkProps['to'] | ((appState: AppState) => string);
}

export interface ThemaMenuItemTransformed
  extends Omit<ThemaMenuItem, 'title' | 'to'> {
  title: string;
  to: string;
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
    to: import.meta.env.REACT_APP_SSO_URL_BELASTINGEN,
    rel: 'external',
    profileTypes: ['private'],
  },
  {
    title: ThemaTitles.AFIS,
    id: Themas.AFIS,
    to: AppRoutes.AFIS,
    profileTypes: ['private', 'commercial'],
  },
  {
    title: ThemaTitles.VAREN,
    id: Themas.VAREN,
    to: AppRoutes.VAREN,
    profileTypes: ['commercial'],
  },
  {
    title: ThemaTitles.BEZWAREN,
    id: Themas.BEZWAREN,
    to: AppRoutes.BEZWAREN,
    profileTypes: ['private', 'commercial'],
  },
  {
    title: ThemaTitles.BELASTINGEN,
    id: Themas.BELASTINGEN,
    to: import.meta.env.REACT_APP_SSO_URL_BELASTINGEN_ZAKELIJK,
    rel: 'external',
    profileTypes: ['commercial'],
    isAlwaysVisible: true,
  },
  {
    title: (appState: AppState) => {
      return getThemaTitleBurgerzakenWithAppState(appState);
    },
    id: Themas.BURGERZAKEN,
    to: (appState) => getThemaUrlBurgerzakenWithAppState(appState),
    profileTypes: ['private'],
  },
  {
    title: ThemaTitles.ERFPACHT,
    id: Themas.ERFPACHT,
    to: import.meta.env.REACT_APP_SSO_URL_MIJNERFPACHT,
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
    to: import.meta.env.REACT_APP_SSO_URL_ERFPACHT_ZAKELIJK,
    profileTypes: ['commercial'],
    rel: 'external',
  },
  {
    title: ThemaTitles.ERFPACHT,
    id: Themas.ERFPACHT,
    to: import.meta.env.REACT_APP_SSO_URL_MIJNERFPACHT_ZAKELIJK,
    rel: 'external',
    profileTypes: ['commercial'],
  },
  {
    title: ThemaTitles.SUBSIDIE,
    id: Themas.SUBSIDIE,
    to: `${import.meta.env.REACT_APP_SSO_URL_SUBSIDIES}?authMethod=digid`,
    rel: 'external',
    profileTypes: ['private'],
  },
  {
    title: ThemaTitles.SUBSIDIE,
    id: Themas.SUBSIDIE,
    to: `${import.meta.env.REACT_APP_SSO_URL_SUBSIDIES}?authMethod=eherkenning`,
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
    to: import.meta.env.REACT_APP_SSO_URL_SVWI,
    rel: 'external',
    profileTypes: ['private'],
  },
  {
    title: (appState: AppState) => {
      return getThemaTitleWithAppState(appState);
    },
    id: Themas.HLI,
    to: AppRoutes.HLI,
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
    to: import.meta.env.REACT_APP_SSO_URL_MILIEUZONE,
    rel: 'external',
    profileTypes: ['private', 'commercial'],
  },
  {
    title: ThemaTitles.PARKEREN,
    id: Themas.PARKEREN,
    to: (appState: AppState) => {
      const hasDecosParkeerVergunningen =
        !!appState.PARKEREN?.content?.vergunningen?.length;
      const urlExternal = appState.PARKEREN?.content?.url ?? '/';
      return hasDecosParkeerVergunningen ? AppRoutes.PARKEREN : urlExternal;
    },
    profileTypes: ['private', 'commercial'],
  },
  {
    title: ThemaTitles.OVERTREDINGEN,
    id: Themas.OVERTREDINGEN,
    to: import.meta.env.REACT_APP_SSO_URL_MILIEUZONE,
    rel: 'external',
    profileTypes: ['private', 'commercial'],
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
    title: ThemaTitles.AVG,
    id: Themas.AVG,
    to: generatePath(AppRoutes.AVG, { page: 1 }),
    profileTypes: ['private'],
  },
  {
    title: ThemaTitles.BODEM,
    id: Themas.BODEM,
    to: AppRoutes.BODEM,
    profileTypes: ['private', 'commercial'],
  },
];
