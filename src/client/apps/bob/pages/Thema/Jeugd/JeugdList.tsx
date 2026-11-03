import { generatePath, Navigate, useParams } from 'react-router';

import { ListPagePaginated } from '../../../../../components/ListPagePaginated/ListPagePaginated.tsx';
import { useHTMLDocumentTitle } from '../../../../../hooks/useHTMLDocumentTitle.ts';
import { type ListPageParamKind, themaConfig } from './Jeugd-thema-config.ts';
import { useJeugdThemaData } from './useJeugdThemaData.ts';

export function JeugdList() {
  const { kind = 'huidige-voorzieningen' } = useParams<{
    kind: ListPageParamKind;
  }>();
  const {
    voorzieningen,
    themaId,
    tableConfig,
    isLoading,
    isError,
    breadcrumbs,
  } = useJeugdThemaData();
  useHTMLDocumentTitle(themaConfig.listPage.route);
  const listPageTableConfig = tableConfig[kind];

  if (!listPageTableConfig) {
    return <Navigate to={generatePath(themaConfig.route.path)} replace />;
  }

  return (
    <ListPagePaginated
      items={voorzieningen.filter(listPageTableConfig.filter)}
      themaId={themaId}
      title={listPageTableConfig.title}
      appRoute={listPageTableConfig.listPageRoute}
      breadcrumbs={breadcrumbs}
      displayProps={listPageTableConfig.displayProps}
      isLoading={isLoading}
      isError={isError}
    />
  );
}
