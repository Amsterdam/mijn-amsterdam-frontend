import { ErfpachtersList } from './ErfpachtersList';
import { KadastraleAanduidingList } from './KadastraleAanduidingList';
import { ErfpachtDossiersDetail } from '../../../../../server/services/erfpacht/erfpacht-types';
import { Datalist } from '../../../../components/Datalist/Datalist';
import { AddressDisplayAndModal } from '../../../../components/LocationModal/LocationModal';

export interface ErfpachtDatalistProps {
  dossier: ErfpachtDossiersDetail;
  debiteurNummer: string | null;
  relatieCode?: string;
}

export function DatalistGeneral({
  dossier,
  relatieCode,
  debiteurNummer,
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
          debiteurNummer={debiteurNummer}
          relatieCode={relatieCode}
        />
      ),
    },
  ];

  return <Datalist rows={rows} />;
}
