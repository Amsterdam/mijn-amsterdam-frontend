import { useParams } from 'react-router';

import { ListPageParamKind, listPageParamKind } from './Klachten-thema-config';
import { useKlachtenThemaData } from './useKlachtenThemaData.hook';
import { ListPagePaginated } from '../../../components/ListPagePaginated/ListPagePaginated';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle';

export function KlachtenList() {
  const { kind = listPageParamKind.lopend } = useParams<{
    kind: ListPageParamKind;
  }>();
  const {
    klachten,
    tableConfig,
    breadcrumbs,
    isLoading,
    isError,
    themaConfig,
  } = useKlachtenThemaData();
  useHTMLDocumentTitle(themaConfig.listPage.route);

  const { filter, sort, title, displayProps, listPageRoute } =
    tableConfig[kind];

  return (
    <ListPagePaginated
      items={klachten.filter(filter).sort(sort)}
      themaId={themaConfig.id}
      title={title}
      appRoute={listPageRoute}
      breadcrumbs={breadcrumbs}
      displayProps={displayProps}
      isLoading={isLoading}
      isError={isError}
    />
  );
}
