import { DocumentTitlesConfig, ThemaMenuItem } from './thema-types';
import { AppRoutes } from '../../universal/config/routes';
import { ThemaID, ThemaIDs } from '../../universal/config/thema';
import { AppState, BagThema } from '../../universal/types/App.types';
import { menuItem as menuItemAfis } from '../pages/Thema/Afis/Afis-render-config';
import { menuItem as menuItemAfval } from '../pages/Thema/Afval/Afval-render-config';
import { menuItem as menuItemAVG } from '../pages/Thema/AVG/AVG-render-config';
import { menuItem as menuItemBezwaren } from '../pages/Thema/Bezwaren/Bezwaren-render-config';
import { menuItem as menuItemBodem } from '../pages/Thema/Bodem/Bodem-render-config';
import { menuItem as menuItemBurgerzaken } from '../pages/Thema/Burgerzaken/Burgerzaken-render-config';
import {
  menuItem as menuItemErfpacht,
  menuItemZakelijk as menuItemErfpachtZakelijk,
} from '../pages/Thema/Erfpacht/Erfpacht-render-config';
import { menuItem as menuItemHLI } from '../pages/Thema/HLI/HLI-render-config';
import { menuItem as menuItemHoreca } from '../pages/Thema/Horeca/Horeca-render-config';
import { menuItem as menuItemInkomen } from '../pages/Thema/Inkomen/Inkomen-render-config';
import { menuItem as menuItemJeugd } from '../pages/Thema/Jeugd/Jeugd-render-config';
import { menuItem as menuItemKlachten } from '../pages/Thema/Klachten/Klachten-render-config';
import { menuItems as profileMenuItems } from '../pages/Thema/Profile/Profile-render-config';
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
  BELASTINGEN: 'Belastingen',
  BODEM: 'Bodem',
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
  // Zorg
  [AppRoutes.ZORG]: `${ThemaTitles.ZORG} | overzicht`,
  [AppRoutes['ZORG/VOORZIENING']]: `Voorziening | ${ThemaTitles.ZORG}`,
  [AppRoutes['ZORG/VOORZIENINGEN_LIST']]: `Voorzieningen | ${ThemaTitles.ZORG}`,

  // Vergunningen
  [AppRoutes.VERGUNNINGEN]: `${ThemaTitles.VERGUNNINGEN} | overzicht`,
  [AppRoutes['VERGUNNINGEN/LIST']]: `Lijst | ${ThemaTitles.VERGUNNINGEN}`,
  [AppRoutes['VERGUNNINGEN/DETAIL']]:
    `Vergunning | ${ThemaTitles.VERGUNNINGEN}`,

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

  // Generic
  [AppRoutes.SEARCH]: `Zoeken`,
  [AppRoutes.NOTIFICATIONS]: `${ThemaTitles.NOTIFICATIONS} | overzicht`,
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
  menuItemAfis,
  menuItemAfval,
  menuItemAVG,
  menuItemBezwaren,
  menuItemBodem,
  menuItemBurgerzaken,
  menuItemErfpacht,
  menuItemErfpachtZakelijk,
  menuItemHLI,
  menuItemHoreca,
  menuItemKlachten,
  {
    title: ThemaTitles.BELASTINGEN,
    id: ThemaIDs.BELASTINGEN,
    to: import.meta.env.REACT_APP_SSO_URL_BELASTINGEN,
    rel: 'external',
    profileTypes: ['private'],
  },
  {
    title: ThemaTitles.VAREN,
    id: ThemaIDs.VAREN,
    to: AppRoutes.VAREN,
    profileTypes: ['commercial'],
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
];
