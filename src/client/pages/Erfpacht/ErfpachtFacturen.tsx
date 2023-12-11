import { Chapters } from '../../../universal/config/chapter';
import { AppRoutes } from '../../../universal/config/routes';
import { isError, isLoading } from '../../../universal/helpers/api';
import { ListPagePaginated } from '../../components/TablePagePaginated/ListPagePaginated';
import { useErfpachtV2Data } from './Erfpacht';
import styles from './Erfpacht.module.scss';

export default function ErfpachtFacturen() {
  const {
    ERFPACHTv2,
    openFacturen,
    displayPropsOpenFacturen,
    titleOpenFacturen,
  } = useErfpachtV2Data();

  return (
    <ListPagePaginated
      items={openFacturen}
      title={`Alle ${titleOpenFacturen?.toLocaleLowerCase()}`}
      appRoute={AppRoutes['ERFPACHTv2/OPEN_FACTUREN']}
      appRouteBack={AppRoutes['ERFPACHTv2']}
      displayProps={displayPropsOpenFacturen ?? {}}
      chapter={Chapters.ERFPACHTv2}
      titleKey="dossieradres"
      isLoading={isLoading(ERFPACHTv2)}
      isError={isError(ERFPACHTv2)}
      tableGridColStyles={[
        styles.FacturenTable_col1,
        styles.FacturenTable_col2,
        styles.FacturenTable_col3,
        styles.FacturenTable_col4,
        styles.FacturenTable_col5,
      ]}
    />
  );
}
