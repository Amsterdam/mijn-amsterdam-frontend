import { useParams } from 'react-router';

import {
  listPageParamKind,
  type ListPageParamKind,
} from './Burgerzaken-thema-config';
import { useBurgerZakenData } from './useBurgerZakenData.hook';
import { ListPagePaginated } from '../../../components/ListPagePaginated/ListPagePaginated';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle';

export function BurgerzakenList() {
  const {
    documents,
    isLoading,
    isError,
    tableConfig,
    breadcrumbs,
    listPageRoute,
    routeConfig,
  } = useBurgerZakenData();
  useHTMLDocumentTitle(routeConfig.listPage.documentTitle);
  const params = useParams<{ kind: ListPageParamKind }>();
  const { kind = listPageParamKind.identiteitsbewijzen } = params;
  const { sort, title, displayProps } = tableConfig[kind];

  return (
    <ListPagePaginated
      items={documents.sort(sort)}
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
