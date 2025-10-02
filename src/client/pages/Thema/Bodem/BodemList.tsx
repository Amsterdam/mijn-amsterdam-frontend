import { themaConfig } from './Bodem-thema-config';
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
    displayProps,
    breadcrumbs,
    listPageRoute,
  } = useBodemListPageData();
  useHTMLDocumentTitle(themaConfig.listPage.route); //TO DO deze gaat niet goed!

  return (
    <ListPagePaginated
      items={items.filter(filter).sort(sort)}
      themaId={themaConfig.id}
      title={themaConfig.title}
      appRoute={listPageRoute}
      breadcrumbs={breadcrumbs}
      displayProps={displayProps}
      isLoading={isLoading}
      isError={isError}
    />
  );
}
