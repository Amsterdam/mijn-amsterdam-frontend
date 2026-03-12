import { useParams } from 'react-router';

import type { ListPageParamKind } from './Parkeren-thema-config.ts';
import { useParkerenData } from './useParkerenData.hook.tsx';
import { ListPagePaginated } from '../../../components/ListPagePaginated/ListPagePaginated.tsx';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle.ts';

export function ParkerenList() {
  const { kind = 'lopende-aanvragen' } = useParams<{
    kind: ListPageParamKind;
  }>();

  const {
    vergunningen,
    id: themaId,
    isLoading,
    isError,
    tableConfig,
    breadcrumbs,
    routeConfig,
  } = useParkerenData();
  useHTMLDocumentTitle(routeConfig.listPage);

  const { displayProps, title, filter, sort, listPageRoute } =
    tableConfig[kind];

  return (
    <ListPagePaginated
      items={vergunningen.filter(filter).sort(sort)}
      themaId={themaId}
      title={title}
      appRoute={listPageRoute}
      breadcrumbs={breadcrumbs}
      displayProps={displayProps}
      isLoading={isLoading}
      isError={isError}
    />
  );
}
