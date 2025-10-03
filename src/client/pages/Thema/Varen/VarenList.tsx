import { useParams } from 'react-router';

import { useVarenThemaData } from './useVarenThemaData.hook';
import { ListPageParamKind } from './Varen-thema-config';
import { VarenOnlyShowAanvragenAfterDateDisclaimer } from './VarenThema';
import { ListPagePaginated } from '../../../components/ListPagePaginated/ListPagePaginated';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle';

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
    routeConfig,
  } = useVarenThemaData();
  useHTMLDocumentTitle(routeConfig.listPage);

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
