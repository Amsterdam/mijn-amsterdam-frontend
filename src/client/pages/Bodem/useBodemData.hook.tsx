import { linkListItems, tableConfig } from './Bodem-thema-config';
import { Themas } from '../../../universal/config/thema';
import { isError, isLoading } from '../../../universal/helpers/api';
import { addLinkElementToProperty } from '../../components/Table/TableV2';
import { useAppStateGetter } from '../../hooks/useAppState';
import { useThemaBreadcrumbs } from '../../hooks/useThemaMenuItems';

export function useBodemData() {
  const { BODEM } = useAppStateGetter();

  const items = addLinkElementToProperty(
    BODEM.content?.metingen ?? [],
    'adres',
    true
  );

  const breadcrumbs = useThemaBreadcrumbs(Themas.BODEM);

  return {
    tableConfig,
    isLoading: isLoading(BODEM),
    isError: isError(BODEM),
    items,
    linkListItems,
    breadcrumbs,
  };
}
