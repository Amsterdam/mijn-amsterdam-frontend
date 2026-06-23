import { useLocation } from 'react-router';

import { useThemaMenuItemByThemaID } from './useThemaMenuItems.ts';
import type { LinkProps } from '../../universal/types/App.types.ts';

export function useThemaBreadcrumbs<ID extends string = string>(
  themaID: ID
): LinkProps[] {
  const themaPaginaBreadcrumb = useThemaMenuItemByThemaID(themaID);
  const location = useLocation();
  const from = location?.state?.from;
  const fromPageType = location?.state?.pageType;

  return [
    themaPaginaBreadcrumb
      ? {
          to: themaPaginaBreadcrumb?.to,
          title: themaPaginaBreadcrumb?.title,
        }
      : null,
    themaPaginaBreadcrumb && fromPageType === 'listpage'
      ? {
          to: from,
          title: 'Lijst',
        }
      : null,
  ].filter((link) => link !== null);
}
