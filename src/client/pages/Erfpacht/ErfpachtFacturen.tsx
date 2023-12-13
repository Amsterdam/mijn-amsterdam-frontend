import { generatePath, useParams } from 'react-router-dom';
import { ErfpachtV2DossiersDetail } from '../../../server/services/simple-connect/erfpacht';
import { BagChapters, Chapters } from '../../../universal/config/chapter';
import { AppRoutes } from '../../../universal/config/routes';
import { isError, isLoading } from '../../../universal/helpers/api';
import { ListPagePaginated } from '../../components/TablePagePaginated/ListPagePaginated';
import { useAppStateBagApi } from '../../hooks/useAppState';
import { useErfpachtV2Data } from './Erfpacht';
import styles from './DossierDetail/ErfpachtDossierDetail.module.scss';
import { BFFApiUrls } from '../../config/api';
import { DataList } from '../../components/DataList/DataList';

export default function ErfpachtFacturen() {
  const { displayPropsAlleFacturen, colStyles } = useErfpachtV2Data();

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
      body={
        !!dossier && (
          <DataList
            className={styles.FacturenBetalerDebiteur}
            rows={[
              {
                rows: [
                  {
                    label: dossier.titelVoorkeursadres,
                    content: dossier.voorkeursadres,
                    className: styles.FacturenBetalerDebiteur_Col1,
                  },
                  {
                    label: dossier.facturen.titelBetaler,
                    content: dossier.facturen.betaler,
                    className: styles.FacturenBetalerDebiteur_Col2,
                  },
                  {
                    label: dossier.facturen.titelDebiteurNummer,
                    content: dossier.facturen.debiteurNummer,
                    className: styles.FacturenBetalerDebiteur_Col3,
                  },
                ],
              },
            ]}
          />
        )
      }
      items={dossier?.facturen?.facturen ?? []}
      title={`Alle ${
        dossier?.facturen.titelFacturen?.toLocaleLowerCase() ?? 'Facturen'
      }`}
      appRoute={AppRoutes['ERFPACHTv2/ALLE_FACTUREN']}
      appRouteParams={{ dossierNummerUrlParam }}
      appRouteBack={AppRoutes['ERFPACHTv2']}
      displayProps={displayPropsAlleFacturen ?? {}}
      chapter={Chapters.ERFPACHTv2}
      titleKey="dossieradres"
      isLoading={api.isLoading}
      isError={api.isError}
      tableGridColStyles={colStyles.facturenTable}
    />
  );
}
