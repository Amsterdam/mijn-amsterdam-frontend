import {
  AppRoutes,
  ChapterTitles,
  Chapters,
  ExternalUrls,
  Chapter,
} from '../../universal/config';
import { LinkProps, SVGComponent } from '../../universal/types/App.types';

import { MainMenuId } from '../components/MainNavBar/MainNavBar.constants';

export interface MenuItem extends LinkProps {
  id: MainMenuId;
  Icon?: SVGComponent;
  submenuItems?: MenuItem[];
  isLoading?: boolean;
  chapter?: Chapter;
}

export const myChaptersMenuItems: MenuItem[] = [
  {
    title: ChapterTitles.BRP,
    id: Chapters.BRP,
    to: AppRoutes.BRP,
    chapter: Chapters.BRP,
  },
  {
    title: ChapterTitles.BELASTINGEN,
    id: Chapters.BELASTINGEN,
    to: ExternalUrls.SSO_BELASTINGEN,
    chapter: Chapters.BELASTINGEN,
    rel: 'external',
  },
  {
    title: ChapterTitles.BURGERZAKEN,
    id: Chapters.BURGERZAKEN,
    to: AppRoutes.BURGERZAKEN,
    chapter: Chapters.BURGERZAKEN,
  },
  {
    title: ChapterTitles.ERFPACHT,
    id: Chapters.ERFPACHT,
    to: ExternalUrls.SSO_ERFPACHT || '',
    chapter: Chapters.ERFPACHT,
    rel: 'external',
  },
  {
    title: ChapterTitles.ZORG,
    id: Chapters.ZORG,
    to: AppRoutes.ZORG,
    chapter: Chapters.ZORG,
  },
  {
    title: ChapterTitles.INKOMEN,
    id: Chapters.INKOMEN,
    to: AppRoutes.INKOMEN,
    chapter: Chapters.INKOMEN,
  },
  {
    title: ChapterTitles.AFVAL,
    id: Chapters.AFVAL,
    to: AppRoutes.AFVAL,
    chapter: Chapters.AFVAL,
  },
  {
    title: ChapterTitles.MILIEUZONE,
    id: Chapters.MILIEUZONE,
    to: ExternalUrls.SSO_MILIEUZONE || '',
    chapter: Chapters.MILIEUZONE,
    rel: 'external',
  },
];
