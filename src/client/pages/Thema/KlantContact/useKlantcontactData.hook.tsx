import { generatePath, useParams } from 'react-router';

import { tableConfigs, themaConfig } from './KlantContact-thema-config.ts';
import {
  isLoading,
  isError,
  hasFailedDependency,
} from '../../../../universal/helpers/api.ts';
import { useAppStateGetter } from '../../../hooks/useAppStateStore.ts';
import { useThemaBreadcrumbs } from '../../../hooks/useThemaBreadcrumbs.ts';

export function useKlantcontactData() {
  const { KLANT_CONTACT } = useAppStateGetter();
  const breadcrumbs = useThemaBreadcrumbs(themaConfig.id);
  const routeParams = useParams();

  return {
    themaConfig,
    id: themaConfig.id,
    title: themaConfig.title,
    contactmomenten: KLANT_CONTACT.content?.contactmomenten ?? [],
    afspraken: KLANT_CONTACT.content?.afspraken ?? [],
    pageLinks: themaConfig.pageLinks,
    isError: isError(KLANT_CONTACT),
    isLoading: isLoading(KLANT_CONTACT),
    dependencyErrors: {
      contactmomenten: hasFailedDependency(KLANT_CONTACT, 'contactmomenten'),
      afspraken: hasFailedDependency(KLANT_CONTACT, 'afspraken'),
    },
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
