import { useParams } from 'react-router';

import { useVergunningenThemaData } from './useVergunningenThemaData.hook.ts';
import type { ListPageParamKind } from './Vergunningen-thema-config.ts';
import { ListPagePaginated } from '../../../components/ListPagePaginated/ListPagePaginated.tsx';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle.ts';

export function VergunningenList() {
  const { kind = 'lopende-aanvragen' } = useParams<{
    kind: ListPageParamKind;
  }>();
  const {
    vergunningen,
    id: themaId,
    isLoading,
    isError,
    tableConfig,
    themaConfig,
    breadcrumbs,
  } = useVergunningenThemaData();
  useHTMLDocumentTitle(themaConfig.listPage.route);

  const { title, displayProps, filter, sort, listPageRoute } =
    tableConfig[kind] ?? null;

  return (
    <ListPagePaginated
      items={vergunningen.filter(filter).sort(sort)}
      themaId={themaId}
      title={title}
      appRoute={listPageRoute}
      breadcrumbs={breadcrumbs}
      displayProps={displayProps}
      isLoading={isLoading}
      isError={isError}
    />
  );
}
