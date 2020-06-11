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
  IconAlert,
} from '../assets/icons';

import { Chapter, Chapters } from '../../universal/config';
import { SVGComponent } from '../../universal/types/App.types';

export const ChapterIcons: Record<Chapter, SVGComponent> = {
  [Chapters.AFVAL]: IconGarbage,
  [Chapters.BELASTINGEN]: IconBelastingen,
  [Chapters.BURGERZAKEN]: IconBurgerZaken,
  [Chapters.BUURT]: IconBurgerZaken,
  [Chapters.INKOMEN]: IconInkomen,
  [Chapters.MIJN_GEGEVENS]: IconMijnGegevens,
  [Chapters.MILIEUZONE]: IconMilieuzone,
  [Chapters.NOTIFICATIONS]: IconMyNotifications,
  [Chapters.ROOT]: IconBurgerZaken,
  [Chapters.TIPS]: IconTips,
  [Chapters.WONEN]: IconWonen,
  [Chapters.ZORG]: IconZorg,
  ALERT: IconAlert,
};
