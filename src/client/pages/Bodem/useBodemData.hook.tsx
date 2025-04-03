import { linkListItems, tableConfig } from './Bodem-thema-config';
import { isError, isLoading } from '../../../universal/helpers/api';
import { addLinkElementToProperty } from '../../components/Table/TableV2';
import { useAppStateGetter } from '../../hooks/useAppState';

export function useBodemData() {
  const { BODEM } = useAppStateGetter();

  const items = addLinkElementToProperty(
    BODEM.content?.metingen ?? [],
    'adres',
    true
  );

  return {
    tableConfig,
    isLoading: isLoading(BODEM),
    isError: isError(BODEM),
    items,
    linkListItems,
  };
}
