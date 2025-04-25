import isError from 'lodash.iserror';

import {
  linkListItems,
  listPageParamKind,
  routes,
  tableConfig,
  themaId,
  themaTitle,
  type ListPageParamKind,
} from './Vergunningen-thema-config';
import styles from './Vergunningen.module.scss';
import { VergunningFrontend } from '../../../../server/services/vergunningen/config-and-types';
import { isLoading } from '../../../../universal/helpers/api';
import { entries } from '../../../../universal/helpers/utils';
import { addLinkElementToProperty } from '../../../components/Table/TableV2';
import { useAppStateGetter } from '../../../hooks/useAppState';
import { useThemaBreadcrumbs } from '../../../hooks/useThemaMenuItems';

export function useVergunningenThemaData() {
  const { VERGUNNINGEN } = useAppStateGetter();
  const vergunningen = addLinkElementToProperty<VergunningFrontend>(
    VERGUNNINGEN.content ?? [],
    'identifier',
    true
  );
  const breadcrumbs = useThemaBreadcrumbs(themaId);

  const tableStyles = {
    [listPageParamKind.actual]: styles.VergunningenTableThemaPagina,
    [listPageParamKind.historic]: styles.VergunningenTableThemaPagina,
    [listPageParamKind.inProgress]: styles.VergunningenTableThemaPagina,
  } as const satisfies Record<ListPageParamKind, string>;

  const tableConfigWithStyles = Object.fromEntries(
    entries(tableConfig).map(([kind, config]) => [
      kind,
      {
        ...config,
        className: tableStyles[kind],
      },
    ])
  );

  return {
    title: themaTitle,
    vergunningen,
    isLoading: isLoading(VERGUNNINGEN),
    isError: isError(VERGUNNINGEN),
    tableConfig: tableConfigWithStyles,
    linkListItems,
    routes,
    breadcrumbs,
  };
}
