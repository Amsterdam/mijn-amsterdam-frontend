import { generatePath, useParams } from 'react-router';

import { tableConfigs, themaConfig } from './KlantContact-thema-config.ts';
import { isLoading, isError } from '../../../../universal/helpers/api.ts';
import { useAppStateGetter } from '../../../hooks/useAppStateStore.ts';
import { useThemaBreadcrumbs } from '../../../hooks/useThemaMenuItems.ts';

export function useKlantcontactData() {
  const { KLANT_CONTACT } = useAppStateGetter();
  const breadcrumbs = useThemaBreadcrumbs(themaConfig.id);
  const routeParams = useParams();

  return {
    themaConfig,
    id: themaConfig.id,
    title: themaConfig.title,
    data: KLANT_CONTACT.content,
    pageLinks: themaConfig.pageLinks,
    isError: isError(KLANT_CONTACT),
    isLoading: isLoading(KLANT_CONTACT),
    routeConfig: themaConfig.route,
    breadcrumbs,
    routeParams,
    tableConfigs,
    listPageRoute: generatePath(
      themaConfig.listPageContactmomenten.route.path,
      {
        page: null,
      }
    ),
  };
}
