import { generatePath, useParams } from 'react-router-dom';
import { ErfpachtV2DossiersDetail } from '../../../server/services/simple-connect/erfpacht';
import { BagChapters, Chapters } from '../../../universal/config/chapter';
import { AppRoutes } from '../../../universal/config/routes';
import { isError, isLoading } from '../../../universal/helpers/api';
import { ListPagePaginated } from '../../components/TablePagePaginated/ListPagePaginated';
import { useAppStateBagApi } from '../../hooks/useAppState';
import { useErfpachtV2Data } from './Erfpacht';
import styles from './Erfpacht.module.scss';
import { BFFApiUrls } from '../../config/api';

export default function ErfpachtFacturen() {
  const { displayPropsOpenFacturen } = useErfpachtV2Data();

  const { dossierNummerUrlParam } = useParams<{
    dossierNummerUrlParam: string;
  }>();

  const [dossier, api] = useAppStateBagApi<ErfpachtV2DossiersDetail>({
    url: `${BFFApiUrls.ERFPACHTv2_DOSSIER_DETAILS}/${dossierNummerUrlParam}`,
    bagChapter: BagChapters.ERFPACHTv2,
    key: dossierNummerUrlParam,
  });

  return (
    <ListPagePaginated
      items={dossier?.facturen?.facturen ?? []}
      title={`Alle ${
        dossier?.facturen.titelFacturen?.toLocaleLowerCase() ?? 'Facturen'
      }`}
      appRoute={AppRoutes['ERFPACHTv2/ALLE_FACTUREN']}
      appRouteParams={{ dossierNummerUrlParam }}
      appRouteBack={AppRoutes['ERFPACHTv2']}
      displayProps={displayPropsOpenFacturen ?? {}}
      chapter={Chapters.ERFPACHTv2}
      titleKey="dossieradres"
      isLoading={api.isLoading}
      isError={api.isError}
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
