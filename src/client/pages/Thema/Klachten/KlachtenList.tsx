import { useKlachtenThemaData } from './useKlachtenThemaData.hook.ts';
import { ListPagePaginated } from '../../../components/ListPagePaginated/ListPagePaginated.tsx';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle.ts';

export function KlachtenList() {
  const {
    klachten,
    tableConfig,
    breadcrumbs,
    isLoading,
    isError,
    routeConfig,
  } = useKlachtenThemaData();
  useHTMLDocumentTitle(routeConfig.listPage);

  return (
    <ListPagePaginated
      items={klachten}
      title={tableConfig.title}
      appRoute={tableConfig.listPageRoute}
      breadcrumbs={breadcrumbs}
      displayProps={tableConfig.displayProps}
      isLoading={isLoading}
      isError={isError}
    />
  );
}
