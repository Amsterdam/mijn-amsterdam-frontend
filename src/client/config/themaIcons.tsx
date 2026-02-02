import { NotificationIcon, SearchIcon } from '@amsterdam/design-system-react-icons';

import { type ThemaID } from '../../universal/config/thema';
import { SVGComponent } from '../../universal/types/App.types';
import { IconInkomenSVWI } from '../assets/icons';

export const ThemaIcons: Record<ThemaID, SVGComponent> = {
  NOTIFICATIONS: NotificationIcon,
  HOME: NotificationIcon,
  SEARCH: SearchIcon,
  SVWI: IconInkomenSVWI,
};
