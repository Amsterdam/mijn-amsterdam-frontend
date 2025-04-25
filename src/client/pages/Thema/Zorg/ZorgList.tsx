import { useParams } from 'react-router';

import { useZorgThemaData } from './useZorgThemaData';
import { ListPageParamKind } from './Zorg-thema-config';
import { HistoricItemsMention } from './ZorgThema';
import { ListPagePaginated } from '../../../components/ListPagePaginated/ListPagePaginated';
import { PageContentCell } from '../../../components/Page/Page';

export function ZorgList() {
  const { kind = 'huidige-voorzieningen' } = useParams<{
    kind: ListPageParamKind;
  }>();

  const {
    voorzieningen,
    tableConfig,
    isLoading,
    isError,
    listPageParamKind,
    breadcrumbs,
  } = useZorgThemaData();

  const { filter, title, displayProps, listPageRoute } = tableConfig[kind];

  return (
    <ListPagePaginated
      items={voorzieningen.filter(filter)}
      title={title}
      appRoute={listPageRoute}
      appRouteParams={{ kind }}
      breadcrumbs={breadcrumbs}
      displayProps={displayProps}
      isLoading={isLoading}
      isError={isError}
      pageContentBottom={
        <PageContentCell spanWide={8} startWide={3}>
          {kind === listPageParamKind.historic && <HistoricItemsMention />}
        </PageContentCell>
      }
    />
  );
}
