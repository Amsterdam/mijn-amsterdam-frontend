import { ChapterTitles } from '../../universal/config';

const DEFAULT_THEMA_VALUE = 'Mijn Amsterdam algemeen';

export default function useThema() {
  return getCurrentThema();
}

export function getCurrentThema(documentTitle?: string) {
  let title = '';
  if (documentTitle === undefined) {
    title = typeof document !== undefined ? document.title : '';
  } else {
    title = documentTitle;
  }

  return (
    Object.values(ChapterTitles).find((t) => {
      return title.includes(t);
    }) ?? DEFAULT_THEMA_VALUE
  );
}
