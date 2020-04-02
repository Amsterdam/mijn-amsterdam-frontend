import {
  AppRoutes,
  ChapterTitles,
  Chapters,
  ExternalUrls,
} from '../../universal/config';
import { LinkProps, SVGComponent } from '../../universal/types/App.types';

import { ChapterIcons } from './chapterIcons';
import { MainMenuId } from '../components/MainNavBar/MainNavBar.constants';

export interface MenuItem extends LinkProps {
  id: MainMenuId;
  Icon?: SVGComponent;
  submenuItems?: MenuItem[];
  isLoading?: boolean;
}

export const myChaptersMenuItems: MenuItem[] = [
  {
    title: ChapterTitles.MIJN_GEGEVENS,
    id: Chapters.MIJN_GEGEVENS,
    to: AppRoutes.MIJN_GEGEVENS,
    Icon: ChapterIcons[Chapters.MIJN_GEGEVENS],
  },
  {
    title: ChapterTitles.BELASTINGEN,
    id: Chapters.BELASTINGEN,
    to: ExternalUrls.SSO_BELASTINGEN,
    Icon: ChapterIcons[Chapters.BELASTINGEN],
    rel: 'external',
  },
  {
    title: ChapterTitles.BURGERZAKEN,
    id: Chapters.BURGERZAKEN,
    to: AppRoutes.BURGERZAKEN,
    Icon: ChapterIcons[Chapters.BURGERZAKEN],
  },
  {
    title: ChapterTitles.WONEN,
    id: Chapters.WONEN,
    to: ExternalUrls.SSO_ERFPACHT || '',
    Icon: ChapterIcons[Chapters.WONEN],
    rel: 'external',
  },
  {
    title: ChapterTitles.ZORG,
    id: Chapters.ZORG,
    to: AppRoutes.ZORG,
    Icon: ChapterIcons[Chapters.ZORG],
  },
  {
    title: ChapterTitles.INKOMEN,
    id: Chapters.INKOMEN,
    to: AppRoutes.INKOMEN,
    Icon: ChapterIcons[Chapters.INKOMEN],
  },
  {
    title: ChapterTitles.AFVAL,
    id: Chapters.AFVAL,
    to: AppRoutes.AFVAL,
    Icon: ChapterIcons[Chapters.AFVAL],
  },
  {
    title: ChapterTitles.MILIEUZONE,
    id: Chapters.MILIEUZONE,
    to: ExternalUrls.SSO_MILIEUZONE || '',
    Icon: ChapterIcons[Chapters.MILIEUZONE],
    rel: 'external',
  },
];
