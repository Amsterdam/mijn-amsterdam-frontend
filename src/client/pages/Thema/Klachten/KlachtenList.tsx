import { useKlachtenThemaData } from './useKlachtenThemaData.hook';
import { ListPagePaginated } from '../../../components/ListPagePaginated/ListPagePaginated';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle';

export function KlachtenList() {
  const {
    klachten,
    tableConfig,
    breadcrumbs,
    isLoading,
    isError,
    routeConfig,
  } = useKlachtenThemaData();
  useHTMLDocumentTitle(routeConfig.listPage.documentTitle);

  return (
    <ListPagePaginated
      items={klachten}
      title={tableConfig.title}
      appRoute={tableConfig.listPageRoute}
      appRouteParams={{}}
      breadcrumbs={breadcrumbs}
      displayProps={tableConfig.displayProps}
      isLoading={isLoading}
      isError={isError}
    />
  );
}
