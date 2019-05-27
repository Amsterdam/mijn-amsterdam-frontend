import { Chapter } from 'App.constants';
import { LinkProps } from 'App.types';
import { AppState } from 'AppState';

import { ApiState } from './api.types';
import { useLocalStorage } from 'hooks/storage.hook';

export interface MyUpdate {
  id: string;
  chapter: Chapter;
  datePublished: string;
  title: string;
  description: string;
  link: LinkProps;
  isUnread?: boolean; // Was this update presented to the user / has it been read
  isActual?: boolean; // Is this update newsworthy
}

export interface MyUpdatesApiState extends ApiState {
  data: {
    items: MyUpdate[];
    total: number;
  };
}

interface MyUpdatesState {
  [id: string]: boolean;
}

export function useUpdatesState() {
  return useLocalStorage('MY_UPDATES', {});
}

// NOTE: Currently we only extract/construct updates from the main focus api data which is not specifically tailored for this use.
// In the future we will get specifically tailored generic update content from various api's which will be integrated in
// a domain wide updates stream.
export default ({ FOCUS }: Pick<AppState, 'FOCUS'>): MyUpdatesApiState => {
  const [myUpdatesState] = useUpdatesState();
  const items = [
    ...FOCUS.data.updates.map(update => {
      return {
        ...update,
        isUnread: !(update.id in myUpdatesState),
      };
    }),
  ].sort((a, b) => {
    const c = new Date(a.datePublished).getTime();
    const d = new Date(b.datePublished).getTime();
    return c > d ? -1 : 1;
  });

  return {
    ...FOCUS,
    data: {
      items,
      total: items.length,
    },
  };
};
