import { useParams } from 'react-router';

import { useVarenThemaData } from './useVarenThemaData.hook';
import { ListPageParamKind } from './Varen-thema-config';
import type { VarenZakenFrontend } from '../../../../server/services/varen/config-and-types';
import { ListPagePaginated } from '../../../components/ListPagePaginated/ListPagePaginated';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle';

export function VarenList() {
  const { kind = 'lopende-aanvragen', page } = useParams<{
    kind: ListPageParamKind;
    page: string;
  }>();
  const {
    varenZaken,
    tableConfig,
    isLoading,
    isError,
    breadcrumbs,
    routeConfig,
  } = useVarenThemaData();
  useHTMLDocumentTitle(routeConfig.listPage.documentTitle);

  const { title, displayProps, listPageRoute, filter, sort } =
    tableConfig[kind];
  const zaken = varenZaken.filter(filter).sort(sort);

  return (
    <ListPagePaginated<VarenZakenFrontend>
      items={zaken}
      title={title}
      isLoading={isLoading}
      isError={isError}
      appRoute={listPageRoute}
      breadcrumbs={breadcrumbs}
      appRouteParams={{ kind, page }}
      displayProps={displayProps}
    />
  );
}
