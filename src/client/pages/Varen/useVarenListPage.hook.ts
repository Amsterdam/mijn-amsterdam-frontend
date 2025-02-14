import {
  varenMeerInformatieLink,
  tableConfig,
  exploitatieVergunningAanvragen,
  ListPageParamKind,
} from './Varen-thema-config';
import { VarenVergunningFrontend } from '../../../server/services/varen/config-and-types';
import { isError, isLoading } from '../../../universal/helpers/api';
import { addLinkElementToProperty } from '../../components/Table/TableV2';
import { useAppStateGetter } from '../../hooks/useAppState';

export function useVarenListPage(kind: ListPageParamKind) {
  const { VAREN } = useAppStateGetter();

  const { filter, sort, displayProps, title } = tableConfig[kind];
  const vergunningen = VAREN.content
    ?.filter((v) => v.caseType !== 'Varen registratie reder')
    .filter(filter)
    .sort(sort);

  const varenVergunningen = addLinkElementToProperty<VarenVergunningFrontend>(
    vergunningen ?? [],
    'vesselName',
    true
  );

  return {
    title,
    displayProps,
    isLoading: isLoading(VAREN),
    isError: isError(VAREN),
    varenVergunningen,
    linkListItems: [varenMeerInformatieLink],
    buttonItems: [exploitatieVergunningAanvragen],
  };
}
