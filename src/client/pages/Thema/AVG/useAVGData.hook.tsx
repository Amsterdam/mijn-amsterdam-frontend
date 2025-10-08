import {
  tableConfig,
  linkListItems,
  themaTitle,
  themaId,
  routeConfig,
} from './AVG-thema-config';
import { isError, isLoading } from '../../../../universal/helpers/api';
import { addLinkElementToProperty } from '../../../components/Table/TableV2';
import { useAppStateGetter } from '../../../hooks/useAppStateStore';
import { useThemaBreadcrumbs } from '../../../hooks/useThemaMenuItems';

export function useAVGData() {
  const { AVG } = useAppStateGetter();

  const avgVerzoeken = addLinkElementToProperty(
    AVG.content?.verzoeken ?? [],
    'id',
    true,
    (avg) => `Bekijk meer over avg verzoek met nummer ${avg.id}`
  );

  const breadcrumbs = useThemaBreadcrumbs(themaId);

  return {
    id: themaId,
    title: themaTitle,
    tableConfig,
    isLoading: isLoading(AVG),
    isError: isError(AVG),
    avgVerzoeken,
    linkListItems,
    breadcrumbs,
    routeConfig,
  };
}
