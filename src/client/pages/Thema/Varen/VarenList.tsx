import { useParams } from 'react-router';

import { useVarenThemaData } from './useVarenThemaData.hook';
import { ListPageParamKind } from './Varen-thema-config';
import type {
  VarenVergunningFrontend,
  VarenZakenFrontend,
} from '../../../../server/services/varen/config-and-types';
import { ListPagePaginated } from '../../../components/ListPagePaginated/ListPagePaginated';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle';

export function VarenList() {
  const { kind = 'lopende-aanvragen', page } = useParams<{
    kind: ListPageParamKind;
    page: string;
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

  const { title, displayProps, listPageRoute } = tableConfig[kind];

  if (kind === 'actieve-vergunningen') {
    const { filter, sort } = tableConfig['actieve-vergunningen'];
    const items = varenVergunningen.filter(filter).sort(sort);

    return (
      <ListPagePaginated<VarenVergunningFrontend>
        items={items}
        themaId={themaId}
        title={title}
        isLoading={isLoading}
        isError={isError}
        appRoute={listPageRoute}
        breadcrumbs={breadcrumbs}
        displayProps={displayProps}
      />
    );
  }

  const { filter, sort } = tableConfig['lopende-aanvragen'];
  const items = varenZaken.filter(filter).sort(sort);
  return (
    <ListPagePaginated<VarenZakenFrontend>
      items={items}
      themaId={themaId}
      title={title}
      isLoading={isLoading}
      isError={isError}
      appRoute={listPageRoute}
      breadcrumbs={breadcrumbs}
      displayProps={displayProps}
    />
  );
}
