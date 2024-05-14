import {
  ChapterMenuItem,
  ChapterTitles,
  myChaptersMenuItems,
} from '../../universal/config';
import { termReplace } from '../hooks/useTermReplacement';

export const themasByProfileType: Record<ProfileType, ChapterMenuItem[]> = {
  private: myChaptersMenuItems
    .filter((item) => item.profileTypes.includes('private'))
    .map((item) => {
      return {
        ...item,
        title: termReplace('private', ChapterTitles[item.id]),
      };
    }),
  'private-attributes': myChaptersMenuItems
    .filter((item) => item.profileTypes.includes('private-attributes'))
    .map((item) => {
      return {
        ...item,
        title: termReplace('private-attributes', ChapterTitles[item.id]),
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
