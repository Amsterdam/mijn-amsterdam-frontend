import { useDataApi } from './api.hook';
import { format } from 'date-fns';
import {
  ApiUrls,
  Chapters,
  AppRoutes,
  DEFAULT_DATE_FORMAT,
} from 'App.constants';

/**
 * This code is a reference implementation for specific api functionality.
 * TODO:
 * - Determine if link title and url are supplied by the api.
 * - Determine if we can use pagination or not.
 */

function getLinkTitle({ chapter, linktTitle }) {
  if (linktTitle) {
    return linktTitle;
  }

  switch (chapter) {
    case Chapters.BELASTINGEN:
      return 'Betaal direct via Mijn Belastingen';
    case Chapters.WONEN:
      return 'Meer informatie';
    default:
      return 'Bekijk details';
  }
}

function getLinkUrl({ chapter, linkUrl }) {
  return linkUrl || AppRoutes[chapter];
}

export const useMijnUpdatesApi = (offset = 0, limit = 3) => {
  const options = { url: ApiUrls.MIJN_UPDATES, params: { offset, limit } };
  const api = useDataApi(options, []);

  return {
    data: api.data.map(update => {
      return {
        ...update,
        dateCreated: format(update.dateCreated, DEFAULT_DATE_FORMAT),
        linkTitle: getLinkTitle(update),
        linkUrl: getLinkUrl(update),
      };
    }),
    refetch: page => api.refetch({ ...options, params: { offset, limit } }),
  };
};
