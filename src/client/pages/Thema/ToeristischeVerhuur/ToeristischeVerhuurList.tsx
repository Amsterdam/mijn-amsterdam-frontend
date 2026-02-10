import { useParams } from 'react-router';

import { ListPageParamKind } from './ToeristischeVerhuur-thema-config';
import { useToeristischeVerhuurThemaData } from './useToeristischeVerhuur.hook';
import { ListPagePaginated } from '../../../components/ListPagePaginated/ListPagePaginated';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle';

export function ToeristischeVerhuurList() {
  const { kind = 'lopende-aanvragen' } = useParams<{
    kind: ListPageParamKind;
  }>();
  const {
    vergunningen,
    id: themaId,
    tableConfigVergunningen,
    isLoading,
    isError,
    breadcrumbs,
    themaConfig,
  } = useToeristischeVerhuurThemaData();
  useHTMLDocumentTitle(themaConfig.listPage.route);

  const listPageTableConfig = tableConfigVergunningen[kind];
  const { title, filter, sort, listPageRoute, displayProps } =
    listPageTableConfig;
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
