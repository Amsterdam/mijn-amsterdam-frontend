import { useParams } from 'react-router-dom';
import { ListPageParamKind } from './Afis-thema-config';
import { ListPagePaginated } from '../../components/ListPagePaginated/ListPagePaginated';
import { useAfisThemaData } from './useAfisThemaData.hook';
import { AfisFactuur } from '../../../server/services/afis/afis-types';
import styles from './Afis.module.scss';

export const AfisFacturen = () => {
  const { kind } = useParams<{ kind: ListPageParamKind }>();
  const { facturen, facturenTableConfig, routes, isFacturenLoading } =
    useAfisThemaData(kind);
  const listPageTableConfig = facturenTableConfig[kind];

  return (
    <ListPagePaginated<AfisFactuur>
      items={facturen as AfisFactuur[]}
      backLinkTitle={listPageTableConfig.title}
      title={listPageTableConfig.title}
      appRoute={routes.listPageFacturen}
      appRouteParams={{ kind }}
      appRouteBack={routes.themaPage}
      displayProps={listPageTableConfig.displayProps}
      isLoading={isFacturenLoading}
      isError={false}
      tableClassName={styles.FacturenTable}
    />
  );
};
