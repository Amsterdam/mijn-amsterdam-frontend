import { BellIcon, SearchIcon } from '@amsterdam/design-system-react-icons';

import { type ThemaID } from '../../universal/config/thema';
import { SVGComponent } from '../../universal/types/App.types';
import {
  IconBelastingen,
  IconInkomenSVWI,
  IconMilieuzone,
  IconOvertredingen,
  IconSubsidie,
  IconVergunningen,
  IconZorg,
} from '../assets/icons';

export const ThemaIcons: Record<ThemaID, SVGComponent> = {
  BELASTINGEN: IconBelastingen,
  MILIEUZONE: IconMilieuzone,
  NOTIFICATIONS: BellIcon,
  OVERTREDINGEN: IconOvertredingen,
  HOME: BellIcon,
  SEARCH: SearchIcon,
  SUBSIDIE: IconSubsidie,
  SVWI: IconInkomenSVWI,
  VERGUNNINGEN: IconVergunningen,
  ZORG: IconZorg,
};
