import { useBodemListPageData } from './useBodemListPageData.hook';
import { ListPagePaginated } from '../../../components/ListPagePaginated/ListPagePaginated';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle';

export function BodemList() {
  const {
    items,
    isLoading,
    isError,
    filter,
    sort,
    title,
    displayProps,
    params,
    breadcrumbs,
    listPageRoute,
    routeConfig,
  } = useBodemListPageData();
  useHTMLDocumentTitle(routeConfig.listPage);

  return (
    <ListPagePaginated
      items={items.filter(filter).sort(sort)}
      title={title}
      appRoute={listPageRoute}
      appRouteParams={params}
      breadcrumbs={breadcrumbs}
      displayProps={displayProps}
      isLoading={isLoading}
      isError={isError}
    />
  );
}
