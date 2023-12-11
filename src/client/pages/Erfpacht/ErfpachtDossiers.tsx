import { Chapters } from '../../../universal/config/chapter';
import { AppRoutes } from '../../../universal/config/routes';
import { isError, isLoading } from '../../../universal/helpers/api';
import { ListPagePaginated } from '../../components/TablePagePaginated/ListPagePaginated';
import { useErfpachtV2Data } from './Erfpacht';
import styles from './Erfpacht.module.scss';

export default function ErfpachtDossiers() {
  const { ERFPACHTv2, dossiers, displayPropsDossiers, titleDossiers } =
    useErfpachtV2Data();

  return (
    <ListPagePaginated
      items={dossiers}
      title="Alle dossiers"
      appRoute={AppRoutes['ERFPACHTv2/DOSSIERS']}
      appRouteBack={AppRoutes['ERFPACHTv2']}
      displayProps={displayPropsDossiers}
      chapter={Chapters.ERFPACHTv2}
      titleKey="voorkeursadres"
      isLoading={isLoading(ERFPACHTv2)}
      isError={isError(ERFPACHTv2)}
      tableGridColStyles={[
        styles.DossiersTable_col1,
        styles.DossiersTable_col2,
        styles.DossiersTable_col3,
        styles.DossiersTable_col4,
      ]}
    />
  );
}
