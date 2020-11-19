import {
  AppRoutes,
  ChapterTitles,
  Chapters,
  Chapter,
} from '../../universal/config';

import { ExternalUrls } from './app';
import { LinkProps } from '../../universal/types/App.types';
import { termReplace } from '../hooks/useTermReplacement';

export interface ChapterMenuItem extends LinkProps {
  id: Chapter;
  profileTypes: ProfileType[];
  isAlwaysVisible?: boolean;
}

const myChaptersMenuItems: ChapterMenuItem[] = [
  {
    title: ChapterTitles.BRP,
    id: Chapters.BRP,
    to: AppRoutes.BRP,
    profileTypes: ['private'],
  },
  {
    title: ChapterTitles.KVK,
    id: Chapters.KVK,
    to: AppRoutes.KVK,
    profileTypes: ['private-commercial', 'commercial'],
  },
  {
    title: ChapterTitles.BELASTINGEN,
    id: Chapters.BELASTINGEN,
    to: ExternalUrls.SSO_BELASTINGEN,
    rel: 'external',
    profileTypes: ['private', 'private-commercial'],
  },
  {
    title: ChapterTitles.BELASTINGEN,
    id: Chapters.BELASTINGEN,
    to: ExternalUrls.EH_SSO_BELASTINGEN,
    rel: 'external',
    profileTypes: ['commercial'],
    isAlwaysVisible: true,
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
    profileTypes: ['private', 'private-commercial'],
  },
  {
    title: ChapterTitles.ERFPACHT,
    id: Chapters.ERFPACHT,
    to: ExternalUrls.EH_SSO_ERFPACHT || '',
    rel: 'external',
    profileTypes: ['commercial'],
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
];

export const chaptersByProfileType: Record<ProfileType, ChapterMenuItem[]> = {
  private: myChaptersMenuItems
    .filter((item) => item.profileTypes.includes('private'))
    .map((item) => {
      return {
        ...item,
        title: termReplace('private', ChapterTitles[item.id]),
      };
    }),
  'private-commercial': myChaptersMenuItems
    .filter((item) => item.profileTypes.includes('private-commercial'))
    .map((item) => {
      return {
        ...item,
        title: termReplace('private-commercial', ChapterTitles[item.id]),
      };
    }),
  commercial: myChaptersMenuItems
    .filter((item) => item.profileTypes.includes('commercial'))
    .map((item) => {
      return {
        ...item,
        title: termReplace('commercial', ChapterTitles[item.id]),
      };
    }),
};
