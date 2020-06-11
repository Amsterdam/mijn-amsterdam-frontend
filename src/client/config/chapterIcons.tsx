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
import { SVGComponent } from '../../universal/types';

export const ChapterIcons: Record<Chapter, SVGComponent> = {
  [Chapters.AFVAL]: IconGarbage,
  [Chapters.BELASTINGEN]: IconBelastingen,
  [Chapters.BURGERZAKEN]: IconBurgerZaken,
  [Chapters.BUURT]: IconBurgerZaken,
  [Chapters.INKOMEN]: IconInkomen,
  [Chapters.BRP]: IconMijnGegevens,
  [Chapters.MILIEUZONE]: IconMilieuzone,
  [Chapters.NOTIFICATIONS]: IconMyNotifications,
  [Chapters.ROOT]: IconBurgerZaken,
  [Chapters.TIPS]: IconTips,
  [Chapters.ERFPACHT]: IconWonen,
  [Chapters.ZORG]: IconZorg,
  ALERT: IconAlert,
};
