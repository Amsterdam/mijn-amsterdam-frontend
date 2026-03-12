import { useAVGListPageData } from './useAVGListPage.hook.ts';
import { ListPagePaginated } from '../../../components/ListPagePaginated/ListPagePaginated.tsx';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle.ts';

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
    themaConfig,
  } = useAVGListPageData();
  useHTMLDocumentTitle(themaConfig.listPage.route);

  return (
    <ListPagePaginated
      items={avgVerzoeken.filter(filter).sort(sort)}
      themaId={themaConfig.id}
      title={title}
      appRoute={listPageRoute}
      breadcrumbs={breadcrumbs}
      displayProps={displayProps}
      isLoading={isLoading}
      isError={isError}
    />
  );
}
