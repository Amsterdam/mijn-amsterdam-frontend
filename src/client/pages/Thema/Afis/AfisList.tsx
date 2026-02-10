import { useParams } from 'react-router';

import {
  AfisDisclaimer,
  AfisDisclaimerOvergedragenFacturen,
} from './AfisThema';
import { useAfisListPageData } from './useAfisListPageData';
import type { AfisFacturenThemaContextParams } from './useAfisThemaData.hook';
import { type AfisFactuurStateFrontend } from '../../../../server/services/afis/afis-types';
import { ListPagePaginated } from '../../../components/ListPagePaginated/ListPagePaginated';
import { PageContentCell } from '../../../components/Page/Page';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle';

function AfisListPageBody({ state }: { state: AfisFactuurStateFrontend }) {
  switch (state) {
    case 'open':
      return <AfisDisclaimer />;
    case 'overgedragen':
      return <AfisDisclaimerOvergedragenFacturen />;
    default:
      return null;
  }
}

type AfisListProps = {
  themaContextParams?: AfisFacturenThemaContextParams;
};

export function AfisList({ themaContextParams }: AfisListProps) {
  const { state = 'open' } = useParams<{ state: AfisFactuurStateFrontend }>();
  const {
    facturen,
    isListPageError,
    isListPageLoading,
    tableConfig,
    isThemaPaginaError,
    isThemaPaginaLoading,
    routeConfig,
    breadcrumbs,
    themaId,
  } = useAfisListPageData(state, themaContextParams);
  useHTMLDocumentTitle(routeConfig);

  const listPageTableConfig = tableConfig[state];
  const facturenFiltered = themaContextParams?.factuurFilterFn
    ? facturen.filter((factuur) =>
        themaContextParams.factuurFilterFn?.(factuur, state)
      )
    : facturen;

  return (
    <ListPagePaginated
      themaId={themaId}
      items={facturenFiltered}
      pageContentTop={
        <PageContentCell>
          <AfisListPageBody state={state} />
        </PageContentCell>
      }
      title={listPageTableConfig.title}
      appRoute={listPageTableConfig.listPageRoute}
      breadcrumbs={breadcrumbs}
      displayProps={listPageTableConfig.displayProps}
      isLoading={isThemaPaginaLoading || isListPageLoading}
      isError={isThemaPaginaError || isListPageError}
    />
  );
}
