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
  profileTypes: ProfileType[];
}

const myChaptersMenuItems: ChapterMenuItem[] = [
  {
    title: ChapterTitles.BRP,
    id: Chapters.BRP,
    to: AppRoutes.BRP,
    profileTypes: ['private'],
  },
  {
    title: ChapterTitles.BELASTINGEN,
    id: Chapters.BELASTINGEN,
    to: ExternalUrls.SSO_BELASTINGEN,
    rel: 'external',
    profileTypes: ['private', 'private-commercial', 'commercial'],
  },
  {
    title: ChapterTitles.BURGERZAKEN,
    id: Chapters.BURGERZAKEN,
    to: AppRoutes.BURGERZAKEN,
    profileTypes: ['private'],
  },
  {
    title: ChapterTitles.ERFPACHT,
    id: Chapters.ERFPACHT,
    to: ExternalUrls.SSO_ERFPACHT || '',
    rel: 'external',
    profileTypes: ['private', 'private-commercial', 'commercial'],
  },
  {
    title: ChapterTitles.ZORG,
    id: Chapters.ZORG,
    to: AppRoutes.ZORG,
    profileTypes: ['private'],
  },
  {
    title: ChapterTitles.INKOMEN,
    id: Chapters.INKOMEN,
    to: AppRoutes.INKOMEN,
    profileTypes: ['private', 'private-commercial'],
  },
  {
    title: ChapterTitles.AFVAL,
    id: Chapters.AFVAL,
    to: AppRoutes.AFVAL,
    profileTypes: ['private', 'private-commercial', 'commercial'],
  },
  {
    title: ChapterTitles.VERGUNNINGEN,
    id: Chapters.VERGUNNINGEN,
    to: AppRoutes.VERGUNNINGEN,
    profileTypes: ['private', 'private-commercial', 'commercial'],
  },
  {
    title: ChapterTitles.MILIEUZONE,
    id: Chapters.MILIEUZONE,
    to: ExternalUrls.SSO_MILIEUZONE || '',
    rel: 'external',
    profileTypes: ['private', 'private-commercial', 'commercial'],
  },
  {
    title: ChapterTitles.KVK,
    id: Chapters.KVK,
    to: AppRoutes.KVK,
    profileTypes: ['private-commercial', 'commercial'],
  },
];

export const chaptersByProfileType: Record<ProfileType, ChapterMenuItem[]> = {
  private: myChaptersMenuItems.filter(item =>
    item.profileTypes.includes('private')
  ),
  'private-commercial': myChaptersMenuItems.filter(item =>
    item.profileTypes.includes('private-commercial')
  ),
  commercial: myChaptersMenuItems.filter(item =>
    item.profileTypes.includes('commercial')
  ),
};
