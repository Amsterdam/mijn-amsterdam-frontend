import { Chapter } from '../../universal/config';
import { LinkProps } from '../../universal/types/App.types';

export interface MyNotification {
  id: string;
  chapter: Chapter;
  datePublished: string;
  title: string;
  description: string;
  link?: LinkProps;
  isUnread?: boolean; // Was this notification presented to the user / has it been read

  // NOTE: Maybe move this to client?
  customLink?: {
    callback: () => void;
    title: string;
  };
}

export interface UPDATESData {
  total: number;
  items: MyNotification[];
}

function addChapterNamespaceToId(chapter: Chapter) {
  return (item: MyNotification) => ({
    ...item,
    id: `${chapter}-${item.id}`,
  });
}

function formatUPDATESData(data: any): UPDATESData {
  return {
    total: 0,
    items: [],
  };
}

export function fetchUPDATES(): Promise<UPDATESData> {
  return Promise.resolve(formatUPDATESData({}));
}
