import {
  ThemaMenuItem,
  ThemaTitles,
  myThemasMenuItems,
} from '../../universal/config';
import { termReplace } from '../hooks/useTermReplacement';

export const themasByProfileType: Record<ProfileType, ThemaMenuItem[]> = {
  private: myThemasMenuItems
    .filter((item) => item.profileTypes.includes('private'))
    .map((item) => {
      return {
        ...item,
        title: termReplace('private', ThemaTitles[item.id]),
      };
    }),
  'private-attributes': myThemasMenuItems
    .filter((item) => item.profileTypes.includes('private-attributes'))
    .map((item) => {
      return {
        ...item,
        title: termReplace('private-attributes', ThemaTitles[item.id]),
      };
    }),
  commercial: myThemasMenuItems
    .filter((item) => item.profileTypes.includes('commercial'))
    .map((item) => {
      return {
        ...item,
        title: termReplace('commercial', ThemaTitles[item.id]),
      };
    }),
};
