import { useAVGListPageData } from './useAVGListPage.hook';
import { ListPagePaginated } from '../../../components/ListPagePaginated/ListPagePaginated';

export function AVGLijst() {
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
  } = useAVGListPageData();

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
