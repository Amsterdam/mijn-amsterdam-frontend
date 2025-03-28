import { useParams } from 'react-router-dom';

import { AfisDisclaimer, AfisDisclaimerOvergedragenFacturen } from './Afis';
import styles from './Afis.module.scss';
import { useAfisListPageData } from './useAfisThemaData.hook';
import { AfisFactuurState } from '../../../server/services/afis/afis-types';
import { ListPagePaginated } from '../../components/ListPagePaginated/ListPagePaginated';
import { PageContentCell } from '../../components/Page/Page';

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

export function AfisFacturen() {
  const { state } = useParams<{ state: AfisFactuurState }>();
  const {
    facturenListResponse,
    isListPageError,
    isListPageLoading,
    facturenTableConfig,
    isThemaPaginaError,
    isThemaPaginaLoading,
    routes,
    themaPaginaBreadcrumb,
  } = useAfisListPageData(state);

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
      appRoute={routes.listPageFacturen}
      appRouteParams={{ state }}
      breadcrumbs={[themaPaginaBreadcrumb]}
      displayProps={listPageTableConfig.displayProps}
      isLoading={isThemaPaginaLoading || isListPageLoading}
      isError={isThemaPaginaError || isListPageError}
      tableClassName={styles[listPageTableConfig.className]}
    />
  );
}
