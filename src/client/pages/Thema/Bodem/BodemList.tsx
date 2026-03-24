import { useBodemListPageData } from './useBodemListPageData.hook.ts';
import { ListPagePaginated } from '../../../components/ListPagePaginated/ListPagePaginated.tsx';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle.ts';

export function BodemList() {
  const {
    themaId,
    items,
    title,
    isLoading,
    isError,
    filter,
    sort,
    displayProps,
    breadcrumbs,
    listPageRoute,
    listPageConfig,
  } = useBodemListPageData();
  useHTMLDocumentTitle(listPageConfig.route);

  return (
    <ListPagePaginated
      items={items.filter(filter).sort(sort)}
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
