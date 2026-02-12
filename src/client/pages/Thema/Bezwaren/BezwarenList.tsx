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
    themaConfig,
    isLoading,
    isError,
    breadcrumbs,
  } = useBezwarenThemaData();
  const listPageTableConfig = tableConfig[kind];
  useHTMLDocumentTitle(themaConfig.listPage.route);

  return (
    <ListPagePaginated
      items={bezwaren.filter(listPageTableConfig.filter)}
      themaId={themaConfig.id}
      title={listPageTableConfig.title}
      appRoute={listPageTableConfig.listPageRoute}
      breadcrumbs={breadcrumbs}
      displayProps={listPageTableConfig.displayProps}
      isLoading={isLoading}
      isError={isError}
    />
  );
}
