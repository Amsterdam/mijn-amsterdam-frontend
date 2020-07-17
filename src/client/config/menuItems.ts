import {
  AppRoutes,
  ChapterTitles,
  Chapters,
  Chapter,
} from '../../universal/config';

import { ExternalUrls } from './app';
import { LinkProps } from '../../universal/types/App.types';

export interface ChapterMenuItem extends LinkProps {
  id: Chapter;
}

export const myChaptersMenuItems: ChapterMenuItem[] = [
  {
    title: ChapterTitles.BRP,
    id: Chapters.BRP,
    to: AppRoutes.BRP,
  },
  {
    title: ChapterTitles.BELASTINGEN,
    id: Chapters.BELASTINGEN,
    to: ExternalUrls.SSO_BELASTINGEN,
    rel: 'external',
  },
  {
    title: ChapterTitles.BURGERZAKEN,
    id: Chapters.BURGERZAKEN,
    to: AppRoutes.BURGERZAKEN,
  },
  {
    title: ChapterTitles.ERFPACHT,
    id: Chapters.ERFPACHT,
    to: ExternalUrls.SSO_ERFPACHT || '',
    rel: 'external',
  },
  {
    title: ChapterTitles.ZORG,
    id: Chapters.ZORG,
    to: AppRoutes.ZORG,
  },
  {
    title: ChapterTitles.INKOMEN,
    id: Chapters.INKOMEN,
    to: AppRoutes.INKOMEN,
  },
  {
    title: ChapterTitles.AFVAL,
    id: Chapters.AFVAL,
    to: AppRoutes.AFVAL,
  },
  {
    title: ChapterTitles.VERGUNNINGEN,
    id: Chapters.VERGUNNINGEN,
    to: AppRoutes.VERGUNNINGEN,
  },
  {
    title: ChapterTitles.MILIEUZONE,
    id: Chapters.MILIEUZONE,
    to: ExternalUrls.SSO_MILIEUZONE || '',
    rel: 'external',
  },
];

export const myChaptersMenuItemsCommercial: ChapterMenuItem[] = [
  {
    title: ChapterTitles.KVK,
    id: Chapters.KVK,
    to: AppRoutes.KVK,
  },
  {
    title: ChapterTitles.BELASTINGEN,
    id: Chapters.BELASTINGEN,
    to: ExternalUrls.SSO_BELASTINGEN,
    rel: 'external',
  },
  {
    title: ChapterTitles.ERFPACHT,
    id: Chapters.ERFPACHT,
    to: ExternalUrls.SSO_ERFPACHT || '',
    rel: 'external',
  },
  {
    title: ChapterTitles.AFVAL,
    id: Chapters.AFVAL,
    to: AppRoutes.AFVAL,
  },
  {
    title: ChapterTitles.VERGUNNINGEN,
    id: Chapters.VERGUNNINGEN,
    to: AppRoutes.VERGUNNINGEN,
  },
  {
    title: ChapterTitles.MILIEUZONE,
    id: Chapters.MILIEUZONE,
    to: ExternalUrls.SSO_MILIEUZONE || '',
    rel: 'external',
  },
];
