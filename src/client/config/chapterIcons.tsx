import {
  IconBelastingen,
  IconBurgerZaken,
  IconGarbage,
  IconInkomen,
  IconStadspas,
  IconMijnGegevens,
  IconMilieuzone,
  IconMyNotifications,
  IconTips,
  IconWonen,
  IconZorg,
  IconAlert,
  IconVergunningen,
  IconHomeCommercial,
} from '../assets/icons';

import { Chapter, Chapters } from '../../universal/config';
import { SVGComponent } from '../../universal/types';

export const ChapterIcons: Record<Chapter, SVGComponent> = {
  [Chapters.AFVAL]: IconGarbage,
  [Chapters.BELASTINGEN]: IconBelastingen,
  [Chapters.BURGERZAKEN]: IconBurgerZaken,
  [Chapters.BUURT]: IconBurgerZaken,
  [Chapters.INKOMEN]: IconInkomen,
  [Chapters.STADSPAS]: IconStadspas,
  [Chapters.BRP]: IconMijnGegevens,
  [Chapters.MILIEUZONE]: IconMilieuzone,
  [Chapters.NOTIFICATIONS]: IconMyNotifications,
  [Chapters.ROOT]: IconBurgerZaken,
  [Chapters.TIPS]: IconTips,
  [Chapters.ERFPACHT]: IconWonen,
  [Chapters.ZORG]: IconZorg,
  [Chapters.VERGUNNINGEN]: IconVergunningen,
  [Chapters.KVK]: IconHomeCommercial,
  ALERT: IconAlert,
};
