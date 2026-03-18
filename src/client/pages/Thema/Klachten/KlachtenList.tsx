import { useParams } from 'react-router';

import type { ListPageParamKind} from './Klachten-thema-config.ts';
import { listPageParamKind } from './Klachten-thema-config.ts';
import { useKlachtenThemaData } from './useKlachtenThemaData.hook.ts';
import { ListPagePaginated } from '../../../components/ListPagePaginated/ListPagePaginated.tsx';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle.ts';

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
