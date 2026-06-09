import {
  erfpachtFacturenTableConfig,
  getTableConfig,
  listPageParamKind,
  themaConfig,
} from './Erfpacht-thema-config.ts';
import { isError, isLoading } from '../../../../universal/helpers/api.ts';
import { addLinkElementToProperty } from '../../../components/Table/TableV2.tsx';
import { useAppStateGetter } from '../../../hooks/useAppStateStore.ts';
import { useThemaBreadcrumbs } from '../../../hooks/useThemaMenuItems.ts';

export function useErfpachtThemaData() {
  const { ERFPACHT } = useAppStateGetter();
  const erfpachtData =
    ERFPACHT.content && 'dossiers' in ERFPACHT.content
      ? ERFPACHT.content
      : null;

  const dossiersBase = erfpachtData?.dossiers ?? null;
  const dossiers = addLinkElementToProperty(
    dossiersBase?.dossiers ?? [],
    'voorkeursadres'
  );

  const zakenBase = erfpachtData?.zaken ?? null;
  const zaken = addLinkElementToProperty(zakenBase ?? [], 'zaakNummer');

  const breadcrumbs = useThemaBreadcrumbs(themaConfig.id);
  const tableConfig = getTableConfig(erfpachtData);

  return {
    themaId: themaConfig.id,
    title: themaConfig.title,
    relatieCode: erfpachtData?.relatieCode,
    dossiers,
    zaken,
    isLoading: isLoading(ERFPACHT),
    isError: isError(ERFPACHT),
    pageLinks: themaConfig.pageLinks,
    tableConfig,
    listPageParamKind,
    breadcrumbs,
    erfpachtFacturenTableConfig,
    themaConfig,
  };
}
