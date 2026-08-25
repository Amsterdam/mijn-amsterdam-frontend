import { addLinkToDossiernummers } from './Erfpacht-helpers.tsx';
import {
  erfpachtFacturenTableConfig,
  getTableConfig,
  listPageParamKind,
  themaConfig,
} from './Erfpacht-thema-config.ts';
<<<<<<<< HEAD:src/client/apps/bob/pages/Thema/Erfpacht/useErfpachtThemaData.hook.ts
import type { ErfpachtDossiersResponse } from '../../../../../../server/services/erfpacht/erfpacht-types.ts';
import { isError, isLoading } from '../../../../../../universal/helpers/api.ts';
import { addLinkElementToProperty } from '../../../../../components/Table/TableV2.tsx';
import { useAppStateGetter } from '../../../../../hooks/useAppStateStore.ts';
import { useThemaBreadcrumbs } from '../../../../../hooks/useThemaBreadcrumbs.ts';
========
import { isError, isLoading } from '../../../../universal/helpers/api.ts';
import { addLinkElementToProperty } from '../../../components/Table/TableV2.tsx';
import { useAppStateGetter } from '../../../hooks/useAppStateStore.ts';
import { useThemaBreadcrumbs } from '../../../hooks/useThemaBreadcrumbs.ts';
>>>>>>>> origin/main:src/client/apps/bob/pages/Thema/Erfpacht/useErfpachtThemaData.hook.tsx

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
  const zaken = addLinkElementToProperty(zakenBase ?? [], 'zaakNummer').map(
    addLinkToDossiernummers
  );

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
