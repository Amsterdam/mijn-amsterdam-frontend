import { useParams } from 'react-router-dom';
import {
  AfisFactuur,
  AfisFactuurState,
} from '../../../server/services/afis/afis-types';
import { ListPagePaginated } from '../../components/ListPagePaginated/ListPagePaginated';
import styles from './Afis.module.scss';
import { useAfisListPageData, useAfisThemaData } from './useAfisThemaData.hook';

export const AfisFacturen = () => {
  const { state } = useParams<{ state: AfisFactuurState }>();
  const { facturenResponse, facturenTableConfig, routes, api } =
    useAfisListPageData(state);

  const listPageTableConfig = facturenTableConfig[state];
  const facturen = facturenResponse?.facturen ?? [];

  return (
    <ListPagePaginated<AfisFactuur>
      items={facturen}
      backLinkTitle={listPageTableConfig.title}
      title={listPageTableConfig.title}
      appRoute={routes.listPageFacturen}
      appRouteParams={{ state }}
      appRouteBack={routes.themaPage}
      displayProps={listPageTableConfig.displayProps}
      isLoading={api.isLoading}
      isError={api.isError}
      tableClassName={styles.FacturenTable}
    />
  );
};
