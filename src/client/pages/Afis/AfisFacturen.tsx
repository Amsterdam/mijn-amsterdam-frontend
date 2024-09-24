import { useParams } from 'react-router-dom';
import {
  AfisFactuur,
  AfisFactuurState,
} from '../../../server/services/afis/afis-types';
import { ListPagePaginated } from '../../components/ListPagePaginated/ListPagePaginated';
import styles from './Afis.module.scss';
import { useAfisThemaData } from './useAfisThemaData.hook';

export const AfisFacturen = () => {
  const { state } = useParams<{ state: AfisFactuurState }>();
  const { facturenByState, facturenTableConfig, routes, isFacturenLoading } =
    useAfisThemaData(state);
  const listPageTableConfig = facturenTableConfig[state];
  const facturen = facturenByState[state] ?? [];
  return (
    <ListPagePaginated<AfisFactuur>
      items={facturen}
      backLinkTitle={listPageTableConfig.title}
      title={listPageTableConfig.title}
      appRoute={routes.listPageFacturen}
      appRouteParams={{ state }}
      appRouteBack={routes.themaPage}
      displayProps={listPageTableConfig.displayProps}
      isLoading={isFacturenLoading}
      isError={false}
      tableClassName={styles.FacturenTable}
    />
  );
};
