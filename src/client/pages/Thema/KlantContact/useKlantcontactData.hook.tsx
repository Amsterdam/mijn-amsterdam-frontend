import { useTransformContactmomenten } from './Contactmomenten/useTransformContactmomenten.tsx';
import { tableConfigs, themaConfig } from './KlantContact-thema-config.ts';
import {
  isError,
  hasFailedDependency,
} from '../../../../universal/helpers/api.ts';
import { useAppStateGetter } from '../../../hooks/useAppStateStore.ts';
import { useIsLoading } from '../../../hooks/useIsLoading.ts';
import { useThemaBreadcrumbs } from '../../../hooks/useThemaBreadcrumbs.ts';

export function useKlantcontactData() {
  const { KLANT_CONTACT } = useAppStateGetter();
  const breadcrumbs = useThemaBreadcrumbs(themaConfig.id);
  const contactmomenten = useTransformContactmomenten(
    KLANT_CONTACT.content?.contactmomenten ?? []
  );
  return {
    themaConfig,
    contactmomenten,
    afspraken: KLANT_CONTACT.content?.afspraken ?? [],
    communicatievoorkeuren:
      KLANT_CONTACT.content?.communicatievoorkeuren ?? null,
    isError: isError(KLANT_CONTACT),
    isLoading: useIsLoading(KLANT_CONTACT),
    dependencyErrors: {
      contactmomenten: hasFailedDependency(KLANT_CONTACT, 'contactmomenten'),
      afspraken: hasFailedDependency(KLANT_CONTACT, 'afspraken'),
      communicatievoorkeuren: hasFailedDependency(
        KLANT_CONTACT,
        'communicatievoorkeuren'
      ),
    },
    breadcrumbs,
    tableConfigs,
  };
}
