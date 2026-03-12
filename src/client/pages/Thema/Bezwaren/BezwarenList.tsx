import { useParams } from 'react-router';

import type { ListPageParamKind } from './Bezwaren-thema-config.ts';
import { useBezwarenThemaData } from './useBezwarenThemaData.hook.ts';
import { ListPagePaginated } from '../../../components/ListPagePaginated/ListPagePaginated.tsx';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle.ts';

export function BezwarenList() {
  const { kind = 'lopende-bezwaren' } = useParams<{
    kind: ListPageParamKind;
  }>();
  const {
    bezwaren,
    tableConfig,
    themaConfig,
    isLoading,
    isError,
    breadcrumbs,
  } = useBezwarenThemaData();
  const listPageTableConfig = tableConfig[kind];
  useHTMLDocumentTitle(themaConfig.listPage.route);

  return (
    <ListPagePaginated
      items={bezwaren.filter(listPageTableConfig.filter)}
      themaId={themaConfig.id}
      title={listPageTableConfig.title}
      appRoute={listPageTableConfig.listPageRoute}
      breadcrumbs={breadcrumbs}
      displayProps={listPageTableConfig.displayProps}
      isLoading={isLoading}
      isError={isError}
    />
  );
}
