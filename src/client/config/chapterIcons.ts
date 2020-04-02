import {
  IconBelastingen,
  IconBurgerZaken,
  IconGarbage,
  IconInkomen,
  IconMijnGegevens,
  IconMilieuzone,
  IconMyNotifications,
  IconTips,
  IconWonen,
  IconZorg,
} from '../assets/icons';

import { Chapter } from '../../universal/config';
import { SVGComponent } from '../../universal/types/App.types';

export const ChapterIcons: {
  [chapter in Chapter]: SVGComponent;
} = {
  AFVAL: IconGarbage,
  MIJN_TIPS: IconTips,
  WONEN: IconWonen,
  INKOMEN: IconInkomen,
  BELASTINGEN: IconBelastingen,
  ZORG: IconZorg,
  MELDINGEN: IconMyNotifications,
  MIJN_GEGEVENS: IconMijnGegevens,
  MILIEUZONE: IconMilieuzone,
  ROOT: IconBurgerZaken,
  MIJN_BUURT: IconBurgerZaken,
  BURGERZAKEN: IconBurgerZaken,
};
