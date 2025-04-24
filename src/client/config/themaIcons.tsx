import { BellIcon, SearchIcon } from '@amsterdam/design-system-react-icons';

import { type ThemaID } from '../../universal/config/thema';
import { SVGComponent } from '../../universal/types/App.types';
import {
  IconBelastingen,
  IconInkomenSVWI,
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
  MILIEUZONE: IconMilieuzone,
  NOTIFICATIONS: BellIcon,
  OVERTREDINGEN: IconOvertredingen,
  PARKEREN: IconParkeren,
  HOME: BellIcon,
  SEARCH: SearchIcon,
  SUBSIDIE: IconSubsidie,
  SVWI: IconInkomenSVWI,
  TOERISTISCHE_VERHUUR: IconToeristischeVerhuur,
  VERGUNNINGEN: IconVergunningen,
  ZORG: IconZorg,
};
