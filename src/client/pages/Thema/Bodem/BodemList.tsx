//import { themaConfig } from './Bodem-thema-config';
import { useBodemListPageData } from './useBodemListPageData.hook';
import { ListPagePaginated } from '../../../components/ListPagePaginated/ListPagePaginated';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle';

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
    routeConfig,
  } = useBodemListPageData();
  useHTMLDocumentTitle(routeConfig);

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
