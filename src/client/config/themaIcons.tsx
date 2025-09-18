import { BellIcon, SearchIcon } from '@amsterdam/design-system-react-icons';

import { type ThemaID } from '../../universal/config/thema-config.ts';
import { SVGComponent } from '../../universal/types/App.types';
import { IconInkomenSVWI } from '../assets/icons';

export const ThemaIcons: Record<ThemaID, SVGComponent> = {
  NOTIFICATIONS: BellIcon,
  HOME: BellIcon,
  SEARCH: SearchIcon,
  SVWI: IconInkomenSVWI,
};
