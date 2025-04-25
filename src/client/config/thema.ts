import { DocumentTitlesConfig, ThemaMenuItem } from './thema-types';
import { AppRoutes } from '../../universal/config/routes';
import { ThemaID, ThemaIDs } from '../../universal/config/thema';
import { BagThema } from '../../universal/types/App.types';
import { menuItem as menuItemAfis } from '../pages/Thema/Afis/Afis-render-config';
import { menuItem as menuItemAfval } from '../pages/Thema/Afval/Afval-render-config';
import { menuItem as menuItemAVG } from '../pages/Thema/AVG/AVG-render-config';
import { menuItem as menuItemBelastingen } from '../pages/Thema/Belastingen/Belastingen-render-config';
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
import { menuItem as menuItemMilieuzone } from '../pages/Thema/Milieuzone/Milieuzone-render-config';
import { menuItem as menuItemOvertredingen } from '../pages/Thema/Overtredingen/Overtredingen-render-config';
import { menuItem as menuItemParkeren } from '../pages/Thema/Parkeren/Parkeren-render-config';
import { menuItems as profileMenuItems } from '../pages/Thema/Profile/Profile-render-config';
import { menuItem as menuItemSubsidies } from '../pages/Thema/Subsidies/Subsidies-render-config';
import { menuItem as menuItemToeristischeVerhuur } from '../pages/Thema/ToeristischeVerhuur/ToeristischeVerhuur-render-config';
import { menuItem as menuItemVaren } from '../pages/Thema/Varen/Varen-render-config';
import { menuItem as menuItemVergunningen } from '../pages/Thema/Vergunningen/Vergunningen-render-config';
import { menuItem as menuItemZorg } from '../pages/Thema/Zorg/Zorg-render-config';

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
  NOTIFICATIONS: 'Actueel',
  HOME: 'Home',
  SEARCH: 'Zoeken',
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
  [AppRoutes.HOME]: 'Home | Mijn Amsterdam',
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
  menuItemParkeren,
  menuItemToeristischeVerhuur,
  menuItemVaren,
  menuItemVergunningen,
  menuItemZorg,
  menuItemBelastingen,
  menuItemSubsidies,
  menuItemOvertredingen,
  menuItemMilieuzone,
];
