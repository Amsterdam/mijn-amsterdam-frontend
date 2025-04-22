import { BellIcon, SearchIcon } from '@amsterdam/design-system-react-icons';

import { type ThemaID } from '../../universal/config/thema';
import { SVGComponent } from '../../universal/types';
import {
  IconBelastingen,
  IconBezwaren,
  IconBodem,
  IconBurgerZaken,
  IconErfpacht,
  IconHLI,
  IconHoreca,
  IconInkomenSVWI,
  IconKlachten,
  IconKrefia,
  IconMilieuzone,
  IconOvertredingen,
  IconParkeren,
  IconSubsidie,
  IconToeristischeVerhuur,
  IconVaren,
  IconVergunningen,
  IconZorg,
} from '../assets/icons';

export const ThemaIcons: Record<ThemaID, SVGComponent> = {
  VAREN: IconVaren,
  BELASTINGEN: IconBelastingen,
  BEZWAREN: IconBezwaren,
  BODEM: IconBodem,
  BURGERZAKEN: IconBurgerZaken,
  ERFPACHT: IconErfpacht,
  HLI: IconHLI,
  HORECA: IconHoreca,
  KLACHTEN: IconKlachten,
  KREFIA: IconKrefia,
  MILIEUZONE: IconMilieuzone,
  NOTIFICATIONS: BellIcon,
  OVERTREDINGEN: IconOvertredingen,
  PARKEREN: IconParkeren,
  HOME: IconBurgerZaken,
  SEARCH: SearchIcon,
  SUBSIDIE: IconSubsidie,
  SVWI: IconInkomenSVWI,
  TOERISTISCHE_VERHUUR: IconToeristischeVerhuur,
  VERGUNNINGEN: IconVergunningen,
  ZORG: IconZorg,
};
