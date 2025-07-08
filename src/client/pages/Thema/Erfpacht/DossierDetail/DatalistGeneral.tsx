import { ErfpachtersList } from './ErfpachtersList.tsx';
import { KadastraleAanduidingList } from './KadastraleAanduidingList.tsx';
import { ErfpachtDossiersDetail } from '../../../../../server/services/erfpacht/erfpacht-types.ts';
import { Datalist } from '../../../../components/Datalist/Datalist.tsx';
import { AddressDisplayAndModal } from '../../../../components/LocationModal/LocationModal.tsx';

export interface ErfpachtDatalistProps {
  dossier: ErfpachtDossiersDetail;
  relatieCode?: string;
}

export function DatalistGeneral({
  dossier,
  relatieCode,
}: ErfpachtDatalistProps) {
  const rows = [
    {
      label: dossier.titelDossierNummer,
      content: dossier.dossierNummer,
    },
    {
      label: dossier.titelVoorkeursadres,
      content: <AddressDisplayAndModal address={dossier.voorkeursadres} />,
    },
    {
      label: dossier.titelKadastraleAanduiding,
      content: (
        <KadastraleAanduidingList
          kadastraleaanduidingen={dossier.kadastraleaanduidingen}
        />
      ),
    },
    {
      label: dossier.titelEersteUitgifte,
      content: dossier.eersteUitgifte,
    },
    {
      label: dossier.titelKopErfpachter,
      content: (
        <ErfpachtersList
          erfpachters={dossier.relaties}
          dossierNummer={dossier.dossierNummer}
          debiteurNummer={dossier.facturen.debiteurNummer}
          relatieCode={relatieCode}
        />
      ),
    },
  ];

  return <Datalist rows={rows} />;
}
