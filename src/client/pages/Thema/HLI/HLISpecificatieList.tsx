import { useHliThemaData } from './useHliThemaData.ts';
import { ListPagePaginated } from '../../../components/ListPagePaginated/ListPagePaginated.tsx';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle.ts';

export function HLISpecificatieList() {
  const {
    themaId,
    specificaties,
    specificatieTableConfig,
    isLoading,
    isError,
    breadcrumbs,
    themaConfig,
  } = useHliThemaData();
  useHTMLDocumentTitle(themaConfig.specificatieListPage.route);

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
