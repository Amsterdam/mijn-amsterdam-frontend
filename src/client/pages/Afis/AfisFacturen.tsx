import { useParams } from 'react-router-dom';

import { AfisDisclaimer, AfisDisclaimerOvergedragenFacturen } from './Afis';
import styles from './Afis.module.scss';
import { useAfisListPageData } from './useAfisThemaData.hook';
import {
  AfisFactuur,
  AfisFactuurState,
} from '../../../server/services/afis/afis-types';
import { ListPagePaginated } from '../../components/ListPagePaginated/ListPagePaginated';

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
  } = useAfisListPageData(state);

  const listPageTableConfig = facturenTableConfig[state];
  const facturen = facturenListResponse?.facturen ?? [];

  return (
    <ListPagePaginated<AfisFactuur>
      items={facturen}
      pageContentTop={<AfisListPageBody state={state} />}
      title={listPageTableConfig.title}
      appRoute={routes.listPageFacturen}
      appRouteParams={{ state }}
      appRouteBack={routes.themaPage}
      displayProps={listPageTableConfig.displayProps}
      isLoading={isThemaPaginaLoading || isListPageLoading}
      isError={isThemaPaginaError || isListPageError}
      tableClassName={styles[listPageTableConfig.className]}
    />
  );
}
