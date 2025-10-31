import { useHliThemaData } from './useHliThemaData';
import { ListPagePaginated } from '../../../components/ListPagePaginated/ListPagePaginated';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle';

export function HLISpecificatieList() {
  const {
    themaId,
    specificaties,
    specificatieTableConfig,
    isLoading,
    isError,
    breadcrumbs,
    routeConfig,
  } = useHliThemaData();
  useHTMLDocumentTitle(routeConfig.specificatieListPage);

  const { sort, title, displayProps, listPageRoute } = specificatieTableConfig;

  return (
    <>
      <ListPagePaginated
        themaId={themaId}
        items={specificaties.sort(sort)}
        title={title}
        appRoute={listPageRoute}
        breadcrumbs={breadcrumbs}
        displayProps={displayProps}
        isLoading={isLoading}
        isError={isError}
      />
    </>
  );
}
