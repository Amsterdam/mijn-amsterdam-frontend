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
    listPageRoute,
    routeConfig,
  } = useAVGListPageData();
  useHTMLDocumentTitle(routeConfig.listPage);

  return (
    <ListPagePaginated
      items={avgVerzoeken.filter(filter).sort(sort)}
      title={title}
      appRoute={listPageRoute}
      breadcrumbs={breadcrumbs}
      displayProps={displayProps}
      isLoading={isLoading}
      isError={isError}
    />
  );
}
