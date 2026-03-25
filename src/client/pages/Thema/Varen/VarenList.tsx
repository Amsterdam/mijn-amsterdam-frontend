import { useParams } from 'react-router';

import { useVarenThemaData } from './useVarenThemaData.hook.ts';
import type { ListPageParamKind } from './Varen-thema-config.ts';
import { VarenOnlyShowAanvragenAfterDateDisclaimer } from './VarenThema.tsx';
import { ListPagePaginated } from '../../../components/ListPagePaginated/ListPagePaginated.tsx';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle.ts';

export function VarenList() {
  const { kind = 'lopende-aanvragen' } = useParams<{
    kind: ListPageParamKind;
  }>();
  const {
    varenZaken,
    varenVergunningen,
    id: themaId,
    tableConfig,
    isLoading,
    isError,
    breadcrumbs,
    themaConfig,
  } = useVarenThemaData();
  useHTMLDocumentTitle(themaConfig.listPage.route);

  const { title, displayProps, listPageRoute, filter, sort, type } =
    tableConfig[kind];
  const varenItems = type === 'vergunning' ? varenVergunningen : varenZaken;
  const bottomDisclaimer =
    type === 'zaak' ? VarenOnlyShowAanvragenAfterDateDisclaimer : '';
  return (
    <ListPagePaginated
      items={varenItems.filter(filter).sort(sort)}
      themaId={themaId}
      title={title}
      isLoading={isLoading}
      isError={isError}
      appRoute={listPageRoute}
      breadcrumbs={breadcrumbs}
      displayProps={displayProps}
      pageContentBottom={bottomDisclaimer}
    />
  );
}
