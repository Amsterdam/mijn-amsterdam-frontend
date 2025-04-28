import { useParams } from 'react-router';

import { ListPageParamKind } from './Bezwaren-thema-config';
import { useBezwarenThemaData } from './useBezwarenThemaData.hook';
import { ListPagePaginated } from '../../../components/ListPagePaginated/ListPagePaginated';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle';

export function BezwarenList() {
  const { kind = 'lopende-bezwaren' } = useParams<{
    kind: ListPageParamKind;
  }>();
  const {
    bezwaren,
    tableConfig,
    routeConfig,
    isLoading,
    isError,
    breadcrumbs,
  } = useBezwarenThemaData();
  const listPageTableConfig = tableConfig[kind];
  useHTMLDocumentTitle(routeConfig.listPage.documentTitle);

  return (
    <ListPagePaginated
      items={bezwaren.filter(listPageTableConfig.filter)}
      title={listPageTableConfig.title}
      appRoute={routeConfig.listPage.path}
      appRouteParams={{ kind }}
      breadcrumbs={breadcrumbs}
      displayProps={listPageTableConfig.displayProps}
      isLoading={isLoading}
      isError={isError}
    />
  );
}
