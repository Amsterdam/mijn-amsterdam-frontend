import { tableConfig, linkListItems } from './config';
import { isError, isLoading } from '../../../universal/helpers/api';
import { addLinkElementToProperty } from '../../components/Table/TableV2';
import { useAppStateGetter } from '../../hooks/useAppState';

export function useAVGData() {
  const { AVG } = useAppStateGetter();

  const avgVerzoeken = addLinkElementToProperty(
    AVG.content?.verzoeken ?? [],
    'id',
    true
  );

  return {
    tableConfig,
    isLoading: isLoading(AVG),
    isError: isError(AVG),
    avgVerzoeken,
    linkListItems,
  };
}
