import { tableConfig } from './config';
import { LoodMeting } from '../../../server/services/bodem/types';
import { isError, isLoading } from '../../../universal/helpers/api';
import { defaultDateFormat } from '../../../universal/helpers/date';
import { addLinkElementToProperty } from '../../components/Table/TableV2';
import { useAppStateGetter } from '../../hooks/useAppState';

function getFilteredBodemItems(items: LoodMeting[] | null) {
  return addLinkElementToProperty(
    (items ?? [])?.map((bodemItem) => ({
      ...bodemItem,
      datumAanvraag: defaultDateFormat(bodemItem.datumAanvraag),
    })),
    'adres'
  );
}

export function useBodemData() {
  const { BODEM } = useAppStateGetter();

  const items = getFilteredBodemItems(BODEM.content?.metingen ?? null);

  return {
    tableConfig,
    isLoading: isLoading(BODEM),
    isError: isError(BODEM),
    items,
  };
}
