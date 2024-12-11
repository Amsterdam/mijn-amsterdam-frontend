import { tableConfig, linkListItems } from './config';
import { isError, isLoading } from '../../../universal/helpers/api';
import { addLinkElementToProperty } from '../../components/Table/TableV2';
import { useAppStateGetter } from '../../hooks/useAppState';

export function useBurgerZakenData() {
  const { BRP } = useAppStateGetter();

  const documents = addLinkElementToProperty(
    BRP.content?.identiteitsbewijzen ?? [],
    'documentType',
    true
  );

  return {
    tableConfig,
    linkListItems,
    isLoading: isLoading(BRP),
    isError: isError(BRP),
    documents,
  };
}
