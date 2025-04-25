import { tableConfig, themaId, themaTitle } from './Jeugd-thema-config';
import { listPageParamKind, listPageTitle } from './Jeugd-thema-config';
import { isError, isLoading } from '../../../../universal/helpers/api';
import { addLinkElementToProperty } from '../../../components/Table/TableV2';
import { useAppStateGetter } from '../../../hooks/useAppState';
import { useThemaBreadcrumbs } from '../../../hooks/useThemaMenuItems';
import styles from '../Zorg/Zorg.module.scss';

// Temporary fix because styles can't be imported in the Jeugd-thema-config.ts
// Because the backend uses that file for routes and cannot read in .scss files.
export const tableStylishConfig = {
  [listPageParamKind.actual]: {
    ...tableConfig[listPageParamKind.actual],
    className: styles.HuidigeRegelingen,
  },
  [listPageParamKind.historic]: {
    ...tableConfig[listPageParamKind.historic],
    className: styles.EerdereRegelingen,
  },
};

export function useJeugdThemaData() {
  const { JEUGD } = useAppStateGetter();

  const voorzieningen = addLinkElementToProperty(
    JEUGD.content ?? [],
    'title',
    true
  );

  return {
    voorzieningen,
    title: themaTitle,
    breadcrumbs: useThemaBreadcrumbs(themaId),
    isLoading: isLoading(JEUGD),
    isError: isError(JEUGD),
    tableConfig: tableStylishConfig,
    listPageTitle,
    listPageParamKind,
  };
}
