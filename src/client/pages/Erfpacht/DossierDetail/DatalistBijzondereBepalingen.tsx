import { ErfpachtDatalistProps } from './DatalistGeneral';
import styles from './ErfpachtDossierDetail.module.scss';
import { TableV2 } from '../../../components/Table/TableV2';

export function DataTableBijzondereBepalingen({
  dossier,
}: ErfpachtDatalistProps) {
  if (dossier.bijzondereBepalingen?.length) {
    const displayPropsBijzondereBepalingen = {
      omschrijving: dossier.bijzondereBepalingen[0].titelBestemmingOmschrijving,
      samengesteldeOppervlakteEenheid:
        dossier.bijzondereBepalingen[0].titelOppervlakte,
    };
    return (
      <TableV2
        className={styles.BijzondereBepalingen}
        items={dossier.bijzondereBepalingen}
        displayProps={displayPropsBijzondereBepalingen}
      />
    );
  }
  return null;
}
