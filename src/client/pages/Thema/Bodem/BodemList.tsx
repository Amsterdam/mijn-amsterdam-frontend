import { useBodemListPageData } from './useBodemListPageData.hook';
import { ListPagePaginated } from '../../../components/ListPagePaginated/ListPagePaginated';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle';
import { routeConfig } from '../Erfpacht/Erfpacht-thema-config';

export function BodemList() {
  const {
    items,
    isLoading,
    isError,
    filter,
    sort,
    themaId,
    title,
    displayProps,
    breadcrumbs,
    listPageRoute,
  } = useBodemListPageData();
  useHTMLDocumentTitle(routeConfig.listPage);

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
