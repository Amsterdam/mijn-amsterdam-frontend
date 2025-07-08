import { ThemaMenuItem } from './thema-types.ts';
import { MIJN_AMSTERDAM } from '../../universal/config/app.ts';
import { menuItem as menuItemAfis } from '../pages/Thema/Afis/Afis-render-config.tsx';
import { menuItem as menuItemAfval } from '../pages/Thema/Afval/Afval-render-config.tsx';
import { menuItem as menuItemAVG } from '../pages/Thema/AVG/AVG-render-config.tsx';
import { menuItem as menuItemBelastingen } from '../pages/Thema/Belastingen/Belastingen-render-config.tsx';
import { menuItem as menuItemBezwaren } from '../pages/Thema/Bezwaren/Bezwaren-render-config.tsx';
import { menuItem as menuItemBodem } from '../pages/Thema/Bodem/Bodem-render-config.tsx';
import { menuItem as menuItemBurgerzaken } from '../pages/Thema/Burgerzaken/Burgerzaken-render-config.tsx';
import {
  menuItem as menuItemErfpacht,
  menuItemZakelijk as menuItemErfpachtZakelijk,
} from '../pages/Thema/Erfpacht/Erfpacht-render-config.tsx';
import { menuItem as menuItemHLI } from '../pages/Thema/HLI/HLI-render-config.tsx';
import { menuItem as menuItemHoreca } from '../pages/Thema/Horeca/Horeca-render-config.tsx';
import { menuItem as menuItemInkomen } from '../pages/Thema/Inkomen/Inkomen-render-config.tsx';
import { menuItem as menuItemJeugd } from '../pages/Thema/Jeugd/Jeugd-render-config.tsx';
import { menuItem as menuItemKlachten } from '../pages/Thema/Klachten/Klachten-render-config.tsx';
import { menuItem as menuItemMilieuzone } from '../pages/Thema/Milieuzone/Milieuzone-render-config.tsx';
import { menuItem as menuItemOvertredingen } from '../pages/Thema/Overtredingen/Overtredingen-render-config.tsx';
import { menuItem as menuItemParkeren } from '../pages/Thema/Parkeren/Parkeren-render-config.tsx';
import { menuItems as profileMenuItems } from '../pages/Thema/Profile/Profile-render-config.tsx';
import { menuItem as menuItemSubsidies } from '../pages/Thema/Subsidies/Subsidies-render-config.tsx';
import { menuItem as menuItemSVWI } from '../pages/Thema/Svwi/Svwi-render-config.tsx';
import { menuItem as menuItemToeristischeVerhuur } from '../pages/Thema/ToeristischeVerhuur/ToeristischeVerhuur-render-config.tsx';
import { menuItem as menuItemVaren } from '../pages/Thema/Varen/Varen-render-config.tsx';
import { menuItem as menuItemVergunningen } from '../pages/Thema/Vergunningen/Vergunningen-render-config.tsx';
import { menuItem as menuItemZorg } from '../pages/Thema/Zorg/Zorg-render-config.tsx';

export const NOT_FOUND_TITLE = 'Pagina niet gevonden';
export const DocumentTitleMain = MIJN_AMSTERDAM;
export const PageTitleMain = MIJN_AMSTERDAM;

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
  menuItemSVWI,
  menuItemToeristischeVerhuur,
  menuItemVaren,
  menuItemVergunningen,
  menuItemZorg,
  menuItemBelastingen,
  menuItemSubsidies,
  menuItemOvertredingen,
  menuItemMilieuzone,
];
