import { generatePath, useParams } from 'react-router';

import {
  listPageParamKind,
  type ListPageParamKind,
} from './Burgerzaken-thema-config.ts';
import { useBurgerZakenData } from './useBurgerZakenData.hook.tsx';
import { ListPagePaginated } from '../../../components/ListPagePaginated/ListPagePaginated.tsx';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle.ts';

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
  useHTMLDocumentTitle(routeConfig.listPage);
  const params = useParams<{ kind: ListPageParamKind }>();
  const { kind = listPageParamKind.identiteitsbewijzen } = params;
  const { sort, title, displayProps } = tableConfig[kind];

  return (
    <ListPagePaginated
      items={documents.sort(sort)}
      title={title}
      appRoute={generatePath(listPageRoute, { kind, page: null })}
      breadcrumbs={breadcrumbs}
      displayProps={displayProps}
      isLoading={isLoading}
      isError={isError}
    />
  );
}
