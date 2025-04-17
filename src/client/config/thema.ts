import { DocumentTitlesConfig, ThemaMenuItem } from './thema-types';
import { AppRoutes } from '../../universal/config/routes';
import { ThemaID, ThemaIDs } from '../../universal/config/thema';
import { AppState, BagThema } from '../../universal/types/App.types';
import { getAfisListPageDocumentTitle } from '../pages/Thema/Afis/Afis-thema-config';
import { getAVGListPageDocumentTitle } from '../pages/Thema/AVG/AVG-thema-config';
import { getBezwarenListPageDocumentTitle } from '../pages/Thema/Bezwaren/Bezwaren-thema-config';
import {
  getThemaTitleBurgerzakenWithAppState,
  getThemaUrlBurgerzakenWithAppState,
} from '../pages/Thema/Burgerzaken/helpers';
import { getThemaTitleWithAppState } from '../pages/Thema/HLI/helpers';
import { menuItem as menuItemInkomen } from '../pages/Thema/Inkomen/Inkomen-render-config';
import { documentTitles as documentTitlesInkomen } from '../pages/Thema/Inkomen/Inkomen-thema-config';
import { menuItem as menuItemJeugd } from '../pages/Thema/Jeugd/Jeugd-render-config';
import { documentTitles as documentTitlesJeugd } from '../pages/Thema/Jeugd/Jeugd-thema-config';
import { menuItems as profileMenuItems } from '../pages/Thema/Profile/Profile-render-config';
import { documentTitles as documentTitlesProfile } from '../pages/Thema/Profile/Profile-thema-config';
import {
  getVarenDetailPageDocumentTitle,
  getVarenListPageDocumentTitle,
} from '../pages/Thema/Varen/Varen-thema-config';
import { getListPageDocumentTitle } from '../pages/Thema/Vergunningen/Vergunningen-thema-config';

/**
 * @deprecated We will remove this in the future in favor of the SWR implementations.
 */
export const BagThemas = Object.fromEntries(
  Object.entries(ThemaIDs).map(([key, key2]) => {
    return [key, `${key2}_BAG`];
  })
) as Record<ThemaID, BagThema>;

/**
 * @deprecated Use the titles exported from the Thema-config files instead.
 */
type ThemaTitles = { [thema in ThemaID]: string };
/**
 * @deprecated Use the titles exported from the Thema-config files instead.
 */
export const ThemaTitles = {
  AFIS: 'Facturen en betalen',
  AFVAL: 'Afval',
  AVG: 'AVG persoonsgegevens',
  BELASTINGEN: 'Belastingen',
  BEZWAREN: 'Bezwaren',
  BODEM: 'Bodem',
  BURGERZAKEN: 'Paspoort en ID-kaart',
  ERFPACHT: 'Erfpacht',
  HLI: 'Stadspas en regelingen bij laag inkomen',
  HORECA: 'Horeca',
  KLACHTEN: 'Klachten',
  KREFIA: 'Kredietbank & FIBU',
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
} as const;
/**
 * @deprecated Use the titles exported from the Thema-config files instead.
 */
export type ThemaTitle = (typeof ThemaTitles)[keyof typeof ThemaTitles];

export const NOT_FOUND_TITLE = 'Pagina niet gevonden';
export const DocumentTitleMain = 'Mijn Amsterdam';
export const PageTitleMain = 'Mijn Amsterdam';

// Used in <html><head><title>{PageTitle}</title></head>
/**
 * @deprecated Use the documentTitles exported from the Thema-config files instead.
 */
export const DocumentTitles: DocumentTitlesConfig = {
  // Afis
  [AppRoutes.AFIS]: `${ThemaTitles.AFIS} | overzicht`,
  [AppRoutes['AFIS/FACTUREN']]: getAfisListPageDocumentTitle(ThemaTitles.AFIS),
  [AppRoutes['AFIS/BETAALVOORKEUREN']]:
    `Betaalvoorkeuren | ${ThemaTitles.AFIS}`,

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

  ...documentTitlesJeugd,

  // Inkomen
  ...documentTitlesInkomen,
  // Mijn gegevens + Contactmomenten
  ...documentTitlesProfile,

  // HLI
  [AppRoutes.HLI]: `Regelingen bij laag inkomen | overzicht`,
  [AppRoutes['HLI/STADSPAS']]: `Stadspas | ${ThemaTitles.HLI}`,
  [AppRoutes['HLI/REGELING']]: `Regeling | ${ThemaTitles.HLI}`,
  [AppRoutes['HLI/REGELINGEN_LIST']]: `Regelingen | ${ThemaTitles.HLI}`,

  // Vergunningen
  [AppRoutes.VERGUNNINGEN]: `${ThemaTitles.VERGUNNINGEN} | overzicht`,
  [AppRoutes['VERGUNNINGEN/LIST']]: `Lijst | ${ThemaTitles.VERGUNNINGEN}`,
  [AppRoutes['VERGUNNINGEN/DETAIL']]:
    `Vergunning | ${ThemaTitles.VERGUNNINGEN}`,

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
  [AppRoutes['KLACHTEN/LIST']]: `Lijst | ${ThemaTitles.KLACHTEN}`,
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
  [AppRoutes.ERFPACHT]: 'Erfpacht | overzicht',
  [AppRoutes['ERFPACHT/DOSSIERS']]: 'Erfpacht | Lijst met dossiers',
  [AppRoutes['ERFPACHT/OPEN_FACTUREN']]: 'Erfpacht | Lijst met open facturen',
  [AppRoutes['ERFPACHT/ALLE_FACTUREN']]: 'Erfpacht | Lijst met facturen',
  [AppRoutes['ERFPACHT/DOSSIERDETAIL']]: 'Erfpacht | dossier',

  // Generic
  [AppRoutes.SEARCH]: `Zoeken`,
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

export const myThemasMenuItems: ThemaMenuItem[] = [
  ...profileMenuItems,
  menuItemInkomen,
  menuItemJeugd,
  {
    title: ThemaTitles.BELASTINGEN,
    id: ThemaIDs.BELASTINGEN,
    to: import.meta.env.REACT_APP_SSO_URL_BELASTINGEN,
    rel: 'external',
    profileTypes: ['private'],
  },
  {
    title: ThemaTitles.AFIS,
    id: ThemaIDs.AFIS,
    to: AppRoutes.AFIS,
    profileTypes: ['private', 'commercial'],
  },
  {
    title: ThemaTitles.VAREN,
    id: ThemaIDs.VAREN,
    to: AppRoutes.VAREN,
    profileTypes: ['commercial'],
  },
  {
    title: ThemaTitles.BEZWAREN,
    id: ThemaIDs.BEZWAREN,
    to: AppRoutes.BEZWAREN,
    profileTypes: ['private', 'commercial'],
  },
  {
    title: ThemaTitles.BELASTINGEN,
    id: ThemaIDs.BELASTINGEN,
    to: import.meta.env.REACT_APP_SSO_URL_BELASTINGEN_ZAKELIJK,
    rel: 'external',
    profileTypes: ['commercial'],
    isAlwaysVisible: true,
  },
  {
    title: (appState: AppState) => {
      return getThemaTitleBurgerzakenWithAppState(appState);
    },
    id: ThemaIDs.BURGERZAKEN,
    to: (appState) => getThemaUrlBurgerzakenWithAppState(appState),
    profileTypes: ['private'],
  },
  {
    title: ThemaTitles.ERFPACHT,
    id: ThemaIDs.ERFPACHT,
    to: AppRoutes.ERFPACHT,
    profileTypes: ['private'],
  },
  {
    title: ThemaTitles.ERFPACHT,
    id: ThemaIDs.ERFPACHT,
    to: import.meta.env.REACT_APP_SSO_URL_ERFPACHT_ZAKELIJK,
    profileTypes: ['commercial'],
    rel: 'external',
  },
  {
    title: ThemaTitles.SUBSIDIE,
    id: ThemaIDs.SUBSIDIE,
    to: `${import.meta.env.REACT_APP_SSO_URL_SUBSIDIES}?authMethod=digid`,
    rel: 'external',
    profileTypes: ['private'],
  },
  {
    title: ThemaTitles.SUBSIDIE,
    id: ThemaIDs.SUBSIDIE,
    to: `${import.meta.env.REACT_APP_SSO_URL_SUBSIDIES}?authMethod=eherkenning`,
    rel: 'external',
    profileTypes: ['commercial'],
  },
  {
    title: ThemaTitles.ZORG,
    id: ThemaIDs.ZORG,
    to: AppRoutes.ZORG,
    profileTypes: ['private'],
  },
  {
    title: ThemaTitles.SVWI,
    id: ThemaIDs.SVWI,
    to: import.meta.env.REACT_APP_SSO_URL_SVWI,
    rel: 'external',
    profileTypes: ['private'],
  },
  {
    title: (appState: AppState) => {
      return getThemaTitleWithAppState(appState);
    },
    id: ThemaIDs.HLI,
    to: AppRoutes.HLI,
    profileTypes: ['private'],
  },
  {
    title: ThemaTitles.AFVAL,
    id: ThemaIDs.AFVAL,
    to: AppRoutes.AFVAL,
    profileTypes: ['private', 'commercial'],
  },
  {
    title: ThemaTitles.VERGUNNINGEN,
    id: ThemaIDs.VERGUNNINGEN,
    to: AppRoutes.VERGUNNINGEN,
    profileTypes: ['private', 'commercial'],
  },
  {
    title: ThemaTitles.MILIEUZONE,
    id: ThemaIDs.MILIEUZONE,
    to: import.meta.env.REACT_APP_SSO_URL_MILIEUZONE,
    rel: 'external',
    profileTypes: ['private', 'commercial'],
  },
  {
    title: ThemaTitles.PARKEREN,
    id: ThemaIDs.PARKEREN,
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
    id: ThemaIDs.OVERTREDINGEN,
    to: import.meta.env.REACT_APP_SSO_URL_MILIEUZONE,
    rel: 'external',
    profileTypes: ['private', 'commercial'],
  },
  {
    title: ThemaTitles.TOERISTISCHE_VERHUUR,
    id: ThemaIDs.TOERISTISCHE_VERHUUR,
    to: AppRoutes.TOERISTISCHE_VERHUUR,
    profileTypes: ['private', 'commercial'],
  },
  {
    title: ThemaTitles.KREFIA,
    id: ThemaIDs.KREFIA,
    to: AppRoutes.KREFIA,
    profileTypes: ['private'],
  },

  {
    title: ThemaTitles.KLACHTEN,
    id: ThemaIDs.KLACHTEN,
    to: AppRoutes.KLACHTEN,
    profileTypes: ['private'],
  },
  {
    title: ThemaTitles.HORECA,
    id: ThemaIDs.HORECA,
    to: AppRoutes.HORECA,
    profileTypes: ['private', 'commercial'],
  },
  {
    title: ThemaTitles.AVG,
    id: ThemaIDs.AVG,
    to: AppRoutes.AVG,
    profileTypes: ['private'],
  },
  {
    title: ThemaTitles.BODEM,
    id: ThemaIDs.BODEM,
    to: AppRoutes.BODEM,
    profileTypes: ['private', 'commercial'],
  },
];
