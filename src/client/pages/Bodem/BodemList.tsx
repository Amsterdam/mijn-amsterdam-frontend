import { useBodemListPageData } from './useBodemListPageData.hook';
import { ListPagePaginated } from '../../components/ListPagePaginated/ListPagePaginated';

export function BodemList() {
  const {
    items,
    isLoading,
    isError,
    filter,
    sort,
    title,
    displayProps,
    params,
    breadcrumbs,
    routes,
  } = useBodemListPageData();

  return (
    <ListPagePaginated
      items={items.filter(filter).sort(sort)}
      title={title}
      appRoute={routes.listPage}
      appRouteParams={params}
      breadcrumbs={breadcrumbs}
      displayProps={displayProps}
      isLoading={isLoading}
      isError={isError}
    />
  );
}
