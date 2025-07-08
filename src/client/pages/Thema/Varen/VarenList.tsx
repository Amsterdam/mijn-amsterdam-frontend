import { useParams } from 'react-router';

import { useVarenThemaData } from './useVarenThemaData.hook.ts';
import { ListPageParamKind } from './Varen-thema-config.ts';
import type { VarenZakenFrontend } from '../../../../server/services/varen/config-and-types.ts';
import { ListPagePaginated } from '../../../components/ListPagePaginated/ListPagePaginated.tsx';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle.ts';

export function VarenList() {
  const { kind = 'lopende-aanvragen', page } = useParams<{
    kind: ListPageParamKind;
    page: string;
  }>();
  const {
    varenZaken,
    tableConfig,
    isLoading,
    isError,
    breadcrumbs,
    routeConfig,
  } = useVarenThemaData();
  useHTMLDocumentTitle(routeConfig.listPage);

  const { title, displayProps, listPageRoute, filter, sort } =
    tableConfig[kind];
  const zaken = varenZaken.filter(filter).sort(sort);

  return (
    <ListPagePaginated<VarenZakenFrontend>
      items={zaken}
      title={title}
      isLoading={isLoading}
      isError={isError}
      appRoute={listPageRoute}
      breadcrumbs={breadcrumbs}
      displayProps={displayProps}
    />
  );
}
