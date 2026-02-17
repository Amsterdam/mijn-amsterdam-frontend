import { useParams } from 'react-router';

import { themaConfig, type ListPageParamKind } from './Jeugd-thema-config';
import { useJeugdThemaData } from './useJeugdThemaData';
import { ListPagePaginated } from '../../../components/ListPagePaginated/ListPagePaginated';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle';

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
