import { ErfpachtV2DossiersDetail } from '../../../../server/services/simple-connect/erfpacht';
import { Datalist } from '../../../components/Datalist/Datalist';
import { ErfpachtersList } from './ErfpachtersList';
import { KadastraleAanduidingList } from './KadastraleAanduidingList';

export interface ErfpachtDatalistProps {
  dossier: ErfpachtV2DossiersDetail;
}

export function DatalistGeneral({ dossier }: ErfpachtDatalistProps) {
  const rows = [
    {
      label: dossier.titelDossierNummer,
      content: dossier.dossierNummer,
    },
    {
      label: dossier.titelVoorkeursadres,
      content: dossier.voorkeursadres,
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
      content: <ErfpachtersList erfpachters={dossier.relaties} />,
    },
  ];

  return <Datalist rows={rows} />;
}
