import { tableConfig, linkListItems } from './AVG-thema-config';
import { ThemaIDs } from '../../../universal/config/thema';
import { isError, isLoading } from '../../../universal/helpers/api';
import { addLinkElementToProperty } from '../../components/Table/TableV2';
import { useAppStateGetter } from '../../hooks/useAppState';
import { useThemaBreadcrumbs } from '../../hooks/useThemaMenuItems';

export function useAVGData() {
  const { AVG } = useAppStateGetter();

  const avgVerzoeken = addLinkElementToProperty(
    AVG.content?.verzoeken ?? [],
    'id',
    true,
    (avg) => `Bekijk meer over avg verzoek met nummer ${avg.id}`
  );

  const breadcrumbs = useThemaBreadcrumbs(ThemaIDs.AVG);

  return {
    tableConfig,
    isLoading: isLoading(AVG),
    isError: isError(AVG),
    avgVerzoeken,
    linkListItems,
    breadcrumbs,
  };
}
