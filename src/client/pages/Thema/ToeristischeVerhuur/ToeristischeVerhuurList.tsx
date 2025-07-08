import { useParams } from 'react-router';

import { ListPageParamKind } from './ToeristischeVerhuur-thema-config.ts';
import { useToeristischeVerhuurThemaData } from './useToeristischeVerhuur.hook.ts';
import { ListPagePaginated } from '../../../components/ListPagePaginated/ListPagePaginated.tsx';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle.ts';

export function ToeristischeVerhuurList() {
  const { kind = 'lopende-aanvragen' } = useParams<{
    kind: ListPageParamKind;
  }>();
  const {
    vergunningen,
    tableConfigVergunningen,
    isLoading,
    isError,
    breadcrumbs,
    routeConfig,
  } = useToeristischeVerhuurThemaData();
  useHTMLDocumentTitle(routeConfig.listPage);

  const listPageTableConfig = tableConfigVergunningen[kind];
  const { title, filter, sort, listPageRoute, displayProps } =
    listPageTableConfig;
  return (
    <ListPagePaginated
      items={vergunningen.filter(filter).sort(sort)}
      title={title}
      appRoute={listPageRoute}
      breadcrumbs={breadcrumbs}
      displayProps={displayProps}
      isLoading={isLoading}
      isError={isError}
    />
  );
}
