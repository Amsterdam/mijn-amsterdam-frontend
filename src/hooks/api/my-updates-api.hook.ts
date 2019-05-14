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
  isUnread: boolean;
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

function formatFocusUpdates(
  items: FocusItem[],
  myUpdatesState: MyUpdatesState
) {
  return items
    .flatMap(item => {
      return item.process.map(step => {
        return {
          id: step.id,
          datePublished: step.datePublished,
          chapter: Chapters.INKOMEN,
          title: `${item.title}: ${step.status} `,
          link: {
            to: `${AppRoutes.INKOMEN}/${item.id}#${step.id}`,
            title: 'Meer informatie',
          },
          description: '',
          isUnread: !(step.id in myUpdatesState),
        };
      });
    })
    .sort((a, b) => {
      const c = new Date(a.datePublished).getTime();
      const d = new Date(b.datePublished).getTime();
      return c > d ? -1 : 1;
    });
}

// NOTE: Currently we only extract/construct updates from the main focus api data which is not specifically tailored for this use.
// In the future we will get specifically tailored generic update content from various api's which will be integrated in
// a domain wide updates stream.
export default ({ FOCUS }: Pick<AppState, 'FOCUS'>): MyUpdatesApiState => {
  const [myUpdatesState] = useUpdatesState();
  const items = formatFocusUpdates(FOCUS.data.items, myUpdatesState);

  return {
    items,
    total: items.length,
  };
};
