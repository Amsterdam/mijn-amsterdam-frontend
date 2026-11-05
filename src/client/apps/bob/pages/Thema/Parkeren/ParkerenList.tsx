import { useParams } from 'react-router';

import { ListPagePaginated } from '../../../../../components/ListPagePaginated/ListPagePaginated.tsx';
import { useHTMLDocumentTitle } from '../../../../../hooks/useHTMLDocumentTitle.ts';
import type { ListPageParamKind } from './Parkeren-thema-config.ts';
import { useParkerenData } from './useParkerenData.hook.tsx';

export function ParkerenList() {
  const { kind = 'lopende-aanvragen' } = useParams<{
    kind: ListPageParamKind;
  }>();

  const {
    vergunningen,
    isLoading,
    isError,
    tableConfig,
    breadcrumbs,
    themaConfig,
  } = useParkerenData();
  useHTMLDocumentTitle(themaConfig.listPage.route);

  const { displayProps, title, filter, sort, listPageRoute } =
    tableConfig[kind];

  return (
    <ListPagePaginated
      items={vergunningen.filter(filter).sort(sort)}
      themaId={themaConfig.id}
      title={title}
      appRoute={listPageRoute}
      breadcrumbs={breadcrumbs}
      displayProps={displayProps}
      isLoading={isLoading}
      isError={isError}
    />
  );
}
