import { useParams } from 'react-router';

import {
  AfisDisclaimer,
  AfisDisclaimerOvergedragenFacturen,
} from './AfisThema';
import { useAfisListPageData } from './useAfisThemaData.hook';
import { AfisFactuurState } from '../../../../server/services/afis/afis-types';
import { ListPagePaginated } from '../../../components/ListPagePaginated/ListPagePaginated';
import { PageContentCell } from '../../../components/Page/Page';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle';

function AfisListPageBody({ state }: { state: AfisFactuurState }) {
  switch (state) {
    case 'open':
      return <AfisDisclaimer />;
    case 'overgedragen':
      return <AfisDisclaimerOvergedragenFacturen />;
    default:
      return null;
  }
}

export function AfisList() {
  const { state = 'open' } = useParams<{ state: AfisFactuurState }>();
  const {
    facturenListResponse,
    isListPageError,
    isListPageLoading,
    facturenTableConfig,
    isThemaPaginaError,
    isThemaPaginaLoading,
    routeConfig,
    breadcrumbs,
  } = useAfisListPageData(state);
  useHTMLDocumentTitle(routeConfig.listPage);

  const listPageTableConfig = facturenTableConfig[state];
  const facturen = facturenListResponse?.facturen ?? [];

  return (
    <ListPagePaginated
      items={facturen}
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
