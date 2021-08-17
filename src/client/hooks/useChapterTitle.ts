import { Chapter } from '../../universal/config';
import { useChapters } from './useChapters';

export function useChapterTitle(chapter: Chapter) {
  const chapters = useChapters();
  const chapterItem = chapters.items.find((item) => item.id === chapter)!;
  return chapterItem?.title ?? chapter;
}
