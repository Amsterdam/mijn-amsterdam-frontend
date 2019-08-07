import { Chapter, WelcomeUpdate } from 'App.constants';
import { LinkProps } from 'App.types';
import { AppState } from 'AppState';
import { useLocalStorage } from 'hooks/storage.hook';
import { ApiState } from './api.types';

export interface MyUpdate {
  id: string;
  chapter: Chapter;
  datePublished: string;
  productTitle?: string;
  title: string;
  description: string;
  link?: LinkProps;
  isUnread?: boolean; // Was this update presented to the user / has it been read
  isActual?: boolean; // Is this update newsworthy
  customLink?: {
    callback: () => void;
    title: string;
  };
}

export interface MyUpdatesApiState extends ApiState {
  data: {
    items: MyUpdate[];
    total: number;
  };
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
    // Static content welcome message
    WelcomeUpdate,

    // Focus update items
    ...FOCUS.data.updates.map(update => {
      return {
        ...update,
        isUnread: myUpdatesState ? !(update.id in myUpdatesState) : true,
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
