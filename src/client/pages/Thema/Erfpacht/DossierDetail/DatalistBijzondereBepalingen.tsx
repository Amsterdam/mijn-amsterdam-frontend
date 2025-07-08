import { ErfpachtDatalistProps } from './DatalistGeneral.tsx';
import { TableV2 } from '../../../../components/Table/TableV2.tsx';

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
        items={dossier.bijzondereBepalingen}
        displayProps={displayPropsBijzondereBepalingen}
      />
    );
  }
  return null;
}
