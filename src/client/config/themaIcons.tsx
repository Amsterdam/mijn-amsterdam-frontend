import { NotificationIcon, SearchIcon } from '@amsterdam/design-system-react-icons';

import { type ThemaID } from '../../universal/config/thema';
import type { SVGComponent } from '../../universal/types/App.types.ts';
import { IconInkomenSVWI } from '../assets/icons/index.tsx';

export const ThemaIcons: Record<ThemaID, SVGComponent> = {
  NOTIFICATIONS: NotificationIcon,
  HOME: NotificationIcon,
  SEARCH: SearchIcon,
  SVWI: IconInkomenSVWI,
};
