import { ErfpachtersList } from './ErfpachtersList';
import { KadastraleAanduidingList } from './KadastraleAanduidingList';
import { ErfpachtV2DossiersDetail } from '../../../../server/services/simple-connect/erfpacht';
import { Datalist } from '../../../components/Datalist/Datalist';
import { LocationModal } from '../../../components/LocationModal/LocationModal';

export interface ErfpachtDatalistProps {
  dossier: ErfpachtV2DossiersDetail;
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
      content: (
        <>
          {dossier.voorkeursadres}
          <br />
          <LocationModal address={dossier.voorkeursadres} />
        </>
      ),
    },
    {
      label: dossier.titelKadastraleaanduiding,
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
