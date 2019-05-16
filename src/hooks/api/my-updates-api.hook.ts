import { AppRoutes, Chapter, Chapters } from 'App.constants';
import { LinkProps } from 'App.types';
import { AppState } from 'AppState';
import createPersistedState from 'use-persisted-state';
import { FocusItem } from 'data-formatting/focus';

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

export type MyUpdatesApiState = {
  items: MyUpdate[];
  total: number;
};

interface MyUpdatesState {
  [id: string]: boolean;
}

const myUpdatesState = createPersistedState('MY_UPDATES');
export const useUpdatesState = () => myUpdatesState({});

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
    items,
    total: items.length,
  };
};
