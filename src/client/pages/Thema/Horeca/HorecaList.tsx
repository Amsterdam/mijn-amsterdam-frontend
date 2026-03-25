import { useParams } from 'react-router';

import type { ListPageParamKind } from './Horeca-thema-config.ts';
import { useHorecaThemaData } from './useHorecaThemaData.hook.ts';
import { ListPagePaginated } from '../../../components/ListPagePaginated/ListPagePaginated.tsx';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle.ts';

export function HorecaList() {
  const { kind = 'lopende-aanvragen' } = useParams<{
    kind: ListPageParamKind;
  }>();
  const {
    vergunningen,
    themaId,
    tableConfig,
    isLoading,
    isError,
    breadcrumbs,
    themaConfig,
  } = useHorecaThemaData();
  useHTMLDocumentTitle(themaConfig.listPage.route);
  const listPageTableConfig = tableConfig[kind];

  return (
    <ListPagePaginated
      items={vergunningen.filter(listPageTableConfig.filter)}
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
