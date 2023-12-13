import { TableV2 } from '../../../components/Table/TableV2';
import { ErfpachtDataListProps } from './DataListGeneral';
import styles from './ErfpachtDossierDetail.module.scss';

export function DataTableBijzondereBepalingen({
  dossier,
}: ErfpachtDataListProps) {
  if (!!dossier.bijzondereBepalingen?.length) {
    const displayPropsBijzondereBepalingen = {
      omschrijving: dossier.bijzondereBepalingen[0].titelBestemmingOmschrijving,
      samengesteldeOppervlakteEenheid:
        dossier.bijzondereBepalingen[0].titelOppervlakte,
    };
    return (
      <TableV2
        className={styles.BijzondereBepalingen}
        gridColStyles={[
          styles.BijzondereBepalingen_Col1,
          styles.BijzondereBepalingen_Col2,
        ]}
        items={dossier.bijzondereBepalingen}
        displayProps={displayPropsBijzondereBepalingen}
      />
    );
  }
  return null;
}
