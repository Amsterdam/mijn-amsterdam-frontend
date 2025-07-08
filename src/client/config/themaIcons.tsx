import { BellIcon, SearchIcon } from '@amsterdam/design-system-react-icons';

import { type ThemaID } from '../../universal/config/thema';
import { SVGComponent } from '../../universal/types/App.types.ts';
import { IconInkomenSVWI } from '../assets/icons/index.tsx';

export const ThemaIcons: Record<ThemaID, SVGComponent> = {
  NOTIFICATIONS: BellIcon,
  HOME: BellIcon,
  SEARCH: SearchIcon,
  SVWI: IconInkomenSVWI,
};
