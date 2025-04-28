import { useAVGListPageData } from './useAVGListPage.hook';
import { ListPagePaginated } from '../../../components/ListPagePaginated/ListPagePaginated';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle';

export function AVGList() {
  const {
    avgVerzoeken,
    isLoading,
    isError,
    filter,
    sort,
    title,
    breadcrumbs,
    displayProps,
    params,
    listPageRoute,
    routeConfig,
  } = useAVGListPageData();
  useHTMLDocumentTitle(routeConfig.listPage.documentTitle);

  return (
    <ListPagePaginated
      items={avgVerzoeken.filter(filter).sort(sort)}
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
